import { contextBridge, ipcRenderer } from "electron"
import { TNewProduct, TNewSell, APIResponse, TProduct, TSell } from "../renderer/src/types/types"

export interface IElectronAPI {
    getProducts: (currentIndex: number, amount: number) => Promise<APIResponse>
    getSells: (currentIndex: number, amount: number) => Promise<APIResponse>
    searchProducts: (req: string, currentIndex: number, amount: number) => Promise<APIResponse>
    searchSells: (req: string, currentIndex: number, amount: number) => Promise<APIResponse>
    addProduct: (product: TNewProduct) => Promise<APIResponse>
    addSell: (sell: TNewSell, test: boolean) => Promise<APIResponse>
    changeProduct: (product: TProduct) => Promise<APIResponse>
    changeSell: (sell: TSell) => Promise<APIResponse>
    deleteProduct: (product: TProduct) => Promise<APIResponse>
    deleteSell: (sell: TSell) => Promise<APIResponse>
    getProductVariants: () => Promise<APIResponse>
    getDistinctProductNames: () => Promise<APIResponse>
    getMaximumProductID: () => Promise<APIResponse>
}

const api: IElectronAPI = {
    getProducts: async (currentIndex: number, amount: number) => ipcRenderer.invoke('get-products', currentIndex, amount),
    getSells: async (currentIndex: number, amount: number) => ipcRenderer.invoke('get-sells', currentIndex, amount),
    searchProducts: async (req: string, currentIndex: number, amount: number) => ipcRenderer.invoke('search-products', req, currentIndex, amount),
    searchSells: async (req: string, currentIndex: number, amount: number) => ipcRenderer.invoke('search-sells', req, currentIndex, amount),
    addProduct: async (product: TNewProduct) => ipcRenderer.invoke('add-product', product),
    addSell: async (sell: TNewSell, test: boolean) => ipcRenderer.invoke('add-sell', sell, test),
    changeProduct: (product: TProduct) => ipcRenderer.invoke('change-product', product),
    changeSell: (sell: TSell) => ipcRenderer.invoke('change-sell', sell),
    deleteProduct: (product: TProduct) => ipcRenderer.invoke('delete-product', product),
    deleteSell: (sell: TSell) => ipcRenderer.invoke('delete-sell', sell),
    getProductVariants: async() => ipcRenderer.invoke('get-product-variants'),
    getDistinctProductNames: async() => ipcRenderer.invoke('get-distinct-product-names'),
    getMaximumProductID: async() => ipcRenderer.invoke('max-product-ID'),
}
contextBridge.exposeInMainWorld('electronAPI', api)