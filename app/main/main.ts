import { app, BrowserWindow, ipcMain, session } from 'electron';
import { gt, like, eq, max, sql, and } from 'drizzle-orm';
import { getDb, initDb } from './src/db/index'
import * as path from 'path';
import { DB_TNewProduct, DB_TProduct, DB_TSell, Product, Sell } from './src/db/schema';
import { TNewSell, APIResponse, TProduct } from '../renderer/src/types/types'

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

ipcMain.handle('delete-product', async (e, el: DB_TProduct) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}
  try{
    response.data = await db.delete(Product).where(eq(Product.id, el.id))
  }
  catch(err){
    response.status = 1
    response.error = err as string
  }
  return response
})

ipcMain.handle('delete-sell', async (e, el: DB_TSell) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}
  try{
    response.data = await db.delete(Sell).where(eq(Sell.id, el.id))
  }
  catch(err){
    response.status = 1
    response.error = err as string
  }
  return response
})

ipcMain.handle('add-product', async (e, product: DB_TNewProduct) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}

  if(product.bought_date){
    const productCandidate = db.select({id:Product.id, bought_amount: Product.units_bought_amount, amount: Product.units_amount, bought_price: Product.bought_price}).from(Product).where(and(eq(Product.name, product.name), eq(Product.bought_date, product.bought_date))).get()
    if(productCandidate){
      try{
        const newAmount = productCandidate.amount+product.units_amount
        const newBoughtAmount = productCandidate.bought_amount+product.units_amount
        const newBoughtPrice = productCandidate.bought_price+product.bought_price
        db.update(Product).set({units_bought_amount: newBoughtAmount, units_amount: newAmount, bought_price: newBoughtPrice}).where(eq(Product.id, productCandidate.id)).run()
      }
      catch(err){
        response.status = 1;
        response.error = err as string
      }
      return response
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

ipcMain.handle('change-product', async (e, product: DB_TProduct) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}

  try {
    var test = db.select().from(Product).where(eq(Product.id, product.id)).get()
    if (test){
      var candidate = db.select().from(Product).where(and(eq(Product.name, product.name), eq(Product.bought_date, product.bought_date))).get()
      if (candidate && candidate.id != product.id){
        response.status = 1;
        response.error = 'Такая закупка уже существует'
        return response
      }
      var oldProduct: TProduct = test as TProduct
      var newProduct: TProduct = product
      newProduct.units_amount = oldProduct.units_amount + (newProduct.units_bought_amount - oldProduct.units_bought_amount)
      db.update(Product).set(newProduct).where(eq(Product.id, newProduct.id)).run()
    }
    else{
      response.status = 1;
      response.error = 'Продукт не найден'
      return response
    }
  }
  catch (err){
    response.status = 1;
    response.error = err as string
  }
  return response
})

ipcMain.handle('change-sell', async (e, sell: DB_TSell) => {
  const db = getDb();
  var response: APIResponse = {status: 0, error: '', data: ''}

  try {
    db.transaction((transaction) => {
      const oldSell = transaction.select().from(Sell).where(eq(Sell.id, sell.id)).get()
      if (oldSell){
        if (sell.product_id){
            if (sell.product_id == oldSell.product_id){
              const diff = oldSell.amount - sell.amount
              const product = db.select({units_amount: Product.units_amount}).from(Product).where(eq(Product.id, sell.product_id)).get()
              if (product){
                const newAmount = product?.units_amount+diff
                db.update(Product).set({units_amount: newAmount}).where(eq(Product.id, sell.product_id)).run()
                db.update(Sell).set(sell).where(eq(Sell.id, sell.id)).run()
              }
              else{
                response.status = 1;
                response.error = 'Товар не найден'
                return response
              }
            }
            else{
              if(oldSell.product_id){
                const oldProduct = db.select({units_amount: Product.units_amount}).from(Product).where(eq(Product.id, oldSell.product_id)).get()
                const newProduct = db.select({units_amount: Product.units_amount}).from(Product).where(eq(Product.id, sell.product_id)).get()
              
                if (oldProduct && newProduct){
                  const oldProductAmount = oldProduct?.units_amount + oldSell.amount
                  const newProductAmount = newProduct.units_amount - sell.amount
                  if (newProductAmount < 0){
                    response.status = 1;
                    response.error = 'Недостаточно товара на складе'
                    return response
                  }

                  db.update(Product).set({units_amount: oldProductAmount}).where(eq(Product.id, oldSell.product_id)).run()
                  db.update(Product).set({units_amount: newProductAmount}).where(eq(Product.id, sell.product_id)).run()
                  db.update(Sell).set(sell).where(eq(Sell.id, sell.id)).run()
                }
              }
              else{
                response.status = 1;
                response.error = 'В описании продажи нет ссылки на товар'
                return response
              }
            }
        }
        else{
          response.status = 1;
          response.error = 'В описании продажи нет ссылки на товар'
          return response
        }
      }
      else{
        response.status = 1;
        response.error = 'Продажа не найдена'
        return response
      }
    })
  }
  catch (err){
    response.status = 1;
    response.error = err as string
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
    fullscreen: true,
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