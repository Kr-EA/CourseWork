import { app, BrowserWindow, ipcMain, session } from 'electron';
import { gt, like, eq, max, sql, and } from 'drizzle-orm';
import { getDb, initDb } from './src/db/index'
import * as path from 'path';
import { DB_TNewProduct, Product, Sell } from './src/db/schema';
import { TNewSell, APIResponse } from '../renderer/src/types/types'

ipcMain.handle('get-products', async (e, currentIndex: number, amount: number) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}
  try{
    response.data = await db.select().from(Product).where(gt(Product.id, currentIndex)).limit(amount)
  }
  catch(err){
    response.status = 1
    response.error = err as string
  }
  return response
})

ipcMain.handle('max-product-ID', async() => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}
  try{
    response.data = db.select({id: max(Product.id)}).from(Product).get()?.id
  }
  catch(err){
    response.status = 1
    response.error = err as string
  }
  return response
})

ipcMain.handle('get-product-variants', async (e) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}
  try{
    response.data = await db.select({id: Product.id, name: Product.name, bought_date: Product.bought_date}).from(Product).where(gt(Product.units_amount, 0))
  }
  catch(err){
    response.status = 1
    response.error = err as string
  }
  return response
})

ipcMain.handle('get-distinct-product-names', async (e) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}
  try{
    response.data = await db
      .select({
        id: sql<number>`MIN(${Product.id})`,
        name: Product.name
      })
      .from(Product)
      .groupBy(Product.name);
  }
  catch(err){
    response.status = 1
    response.error = err as string
  }
  return response
})

ipcMain.handle('get-sells', async (e, currentIndex: number, amount: number) => {
  const db = getDb();

  var response: APIResponse = {status: 0, error: '', data: ''}

  try{
    response.data = await db.query.Sell.findMany({
      where: gt(Sell.id, currentIndex),
      limit: amount,                  
      with: {
        product: true,
      },
    });
  }
  catch(err){
    response.status = 1
    response.error = err as string
  }
  return response;
});

ipcMain.handle('search-products', async (e, req: string, currentIndex: number, amount: number) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}
  try {
    response.data = await db.select().from(Product).where(like(Product.name, `%${req}%`)).limit(amount).offset(currentIndex)
  }
  catch(err){
    response.status = 1
    response.error = err as string
  }
  return response
})

ipcMain.handle('search-sells', async (e, req: string, currentIndex: number, amount: number) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}
  try{
    response.data = await db.select()
    .from(Sell)
    .leftJoin(Product, eq(Sell.product_id, Product.id))
    .where(
      like(Product.name, `%${req}%`)
    )
    .limit(amount)
    .offset(currentIndex);
  }
  catch (err){
    response.status = 1;
    response.error = err as string
  }

  return response;
})

ipcMain.handle('add-product', async (e, product: DB_TNewProduct) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}

  if(product.bought_date){
    const productCandidate = db.select({id:Product.id, amount: Product.units_amount}).from(Product).where(and(eq(Product.name, product.name), eq(Product.bought_date, product.bought_date))).get()
    if(productCandidate){
      try{
        const newAmount = productCandidate.amount+product.units_amount
        db.update(Product).set({units_amount: newAmount}).where(eq(Product.id, productCandidate.id)).run()
      }
      catch(err){
        response.status = 1;
        response.error = err as string
      }
      return response
    }
  }

  else{
    try {
      await db.insert(Product).values(product)
    }
    catch (err){
      response.status = 1;
      response.error = err as string
    }
  }

  return response
})

ipcMain.handle('add-sell', async (e, sell: TNewSell, test: boolean) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}
  if (!sell.product_id){
    response.error = 'Некорректный ID товара'
    response.status = 1
    return response
  }
  const id = sell.product_id
  db.transaction((transaction) => {
    var product = transaction.select({amount: Product.units_amount}).from(Product).where(eq(Product.id, id)).get()
    if (!product){
      response.error = 'Товар не найден'
      response.status = 1
      return response
    }
    if (sell.amount > product.amount) {
      response.error = 'Недостаточно товара на складе'
      response.status = 1
      return response
    }
    var newAmount = product.amount - sell.amount
    transaction.insert(Sell).values(sell).run()
    if (!test){
      transaction.update(Product).set({units_amount: newAmount}).where(eq(Product.id, id)).run()
    }
  });
  return response
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
  } catch (err) {
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