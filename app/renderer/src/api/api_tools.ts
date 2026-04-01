import {APIResponse, TNewProduct, TNewSell, TProduct, TSell} from '../types/types'

export async function loadSells(req: string | null, currentIndex: number, amount: number){
    if(!req){
        let response: APIResponse = await window.electronAPI.getSells(currentIndex, amount)
        response.data = response.data.map((el: TSell) => ({...el, product_name: `${el.product.name} (${el.product.bought_date.toLocaleDateString('ru-RU')})`}))
        return response
    }
    else{
        let response: APIResponse = await window.electronAPI.searchSells(req, currentIndex, amount)
        response.data = response.data.map((el: {Sell: TSell, Product: TProduct}) => ({...el.Sell, product_name: `${el.Product.name} (${el.Product.bought_date.toLocaleDateString('ru-RU')})`}))
        return response
    } 
}

export async function loadProducts(req: string | null, currentIndex: number, amount: number){
    if(!req || req.length == 0){
        return await window.electronAPI.getProducts(currentIndex, amount)
    }
    else{
        return await window.electronAPI.searchProducts(req, currentIndex, amount)
    }
}

export async function addProduct(product: TNewProduct) {
    const response = await window.electronAPI.addProduct(product)
    return response
}

export async function addSell(sell: TNewSell, test: boolean) {
    const response = await window.electronAPI.addSell(sell, test)
    return response
}

export async function getProductVariants() {
    const response = await window.electronAPI.getProductVariants()
    return response
}

export async function changeSell(el: TSell) {
    const response = await window.electronAPI.changeSell(el)
    return response
}

export async function changeProduct(el: TProduct) {
    const response = await window.electronAPI.changeProduct(el)
    console.log(response);
    return response
}

export async function deleteSell(el: TSell) {
    const response = await window.electronAPI.deleteSell(el)
    return response
}

export async function deleteProduct(el: TProduct) {
    const response = await window.electronAPI.deleteProduct(el)
    return response
}

export async function getDistinctProductNames() {
    const response = await window.electronAPI.getDistinctProductNames()
    return response
}

export async function getMaximumProductID() {
    const response = await window.electronAPI.getMaximumProductID()
    return response
}

export async function getProductStats(products: Array<string>, startPeriod: string, endPeriod: string) {
    const response = await window.electronAPI.getProductStats(products, startPeriod, endPeriod)
    return response
}

export async function getDataAnalytics(data: Array<{day: string, value: number}>) {
    const response = await window.electronAPI.analyzeSales(data)
    return response
}

export async function getSellsStonks(startPeriod: string, endPeriod: string){
    const response = await window.electronAPI.getSellStonks(startPeriod, endPeriod)
    return response
}