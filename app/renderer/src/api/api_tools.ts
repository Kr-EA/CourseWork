import {APIResponse, TNewProduct, TNewSell, TProduct, TSell} from '../types/types'

export async function loadSells(req: string | null, currentIndex: number, amount: number){
    if(!req){
        let response: APIResponse = await window.electronAPI.getSells(currentIndex, amount)
        response.data = response.data.map((el: TSell) => ({...el, product_name: el.product.name}))
        return response
    }
    else{
        let response: APIResponse = await window.electronAPI.searchSells(req, currentIndex, amount)
        response.data = response.data.map((el: {Sell: TSell, Product: TProduct}) => ({...el.Sell, product_name: el.Product.name}))
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

export async function getDistinctProductNames() {
    const response = await window.electronAPI.getDistinctProductNames()
    return response
}

export async function getMaximumProductID() {
    const response = await window.electronAPI.getMaximumProductID()
    return response
}