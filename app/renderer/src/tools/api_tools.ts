import {TProduct, TSell} from '../types/types'

export async function loadSells(req: string | null, currentIndex: number, amount: number){
    var arr: Array<TSell>
    if(!req){
        arr = (await window.electronAPI.getSells(currentIndex, amount)).map((el) => ({...el, product_name: el.product.name}))
    }
    else{
        arr = (await window.electronAPI.searchSells(req, currentIndex, amount)).map((el) => ({...el.Sell, product_name: el.Product.name}))
    }
    return arr
}

export async function loadProducts(req: string | null, currentIndex: number, amount: number){
    var arr: Array<TProduct> 
    if(!req || req.length == 0){
        arr = await window.electronAPI.getProducts(currentIndex, amount)
    }
    else{
        arr = await window.electronAPI.searchProducts(req, currentIndex, amount)
    }
    return arr
}