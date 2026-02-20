import { app, BrowserWindow, ipcMain, session } from 'electron';
import { gt, desc, and, like, eq } from 'drizzle-orm';
import { getDb, initDb } from './src/db/index'
import * as path from 'path';
import { Product, Sell } from './src/db/schema';
import * as schema from './src/db/schema'

ipcMain.handle('get-products', async (e, currentIndex: number, amount: number) => {
  const db = getDb();
  const result = await db.select().from(Product).where(gt(Product.id, currentIndex)).limit(amount)
  return result
})

ipcMain.handle('get-sells', async (e, currentIndex: number, amount: number) => {
  const db = getDb();

  const result = await db.query.Sell.findMany({
    where: gt(Sell.id, currentIndex),
    limit: amount,                  
    with: {
      product: true,
    },
  });
  return result;
});

ipcMain.handle('search-products', async (e, req: string, currentIndex: number, amount: number) => {
  const db = getDb();
  const result = await db.select().from(Product).where(like(Product.name, `%${req}%`)).limit(amount).offset(currentIndex)
  return result
})

ipcMain.handle('search-sells', async (e, req: string, currentIndex: number, amount: number) => {
  const db = getDb();

  const result = await db.select()
  .from(Sell)
  .leftJoin(Product, eq(Sell.product_id, Product.id))
  .where(
    like(Product.name, `%${req}%`)
  )
  .limit(amount)
  .offset(currentIndex);

  return result;
})

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, 
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  } else {
    win.loadURL('http://localhost:3000');
  }
}

app.whenReady().then(() => {

  try {
    initDb();
    console.log('[MAIN] Database is ready.');
  } catch (err) {
    console.error('[MAIN] Failed to start DB:', err);
    app.quit();
    return;
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});