import { contextBridge, ipcRenderer } from "electron"
import { TNewProduct, TNewSell, APIResponse } from "../renderer/src/types/types"

export interface IElectronAPI {
    getProducts: (currentIndex: number, amount: number) => Promise<APIResponse>
    getSells: (currentIndex: number, amount: number) => Promise<APIResponse>
    searchProducts: (req: string, currentIndex: number, amount: number) => Promise<APIResponse>
    searchSells: (req: string, currentIndex: number, amount: number) => Promise<APIResponse>
    addProduct: (product: TNewProduct) => Promise<APIResponse>
    addSell: (sell: TNewSell) => Promise<APIResponse>
    getProductVariants: () => Promise<APIResponse>
}

const api: IElectronAPI = {
    getProducts: async (currentIndex: number, amount: number) => ipcRenderer.invoke('get-products', currentIndex, amount),
    getSells: async (currentIndex: number, amount: number) => ipcRenderer.invoke('get-sells', currentIndex, amount),
    searchProducts: async (req: string, currentIndex: number, amount: number) => ipcRenderer.invoke('search-products', req, currentIndex, amount),
    searchSells: async (req: string, currentIndex: number, amount: number) => ipcRenderer.invoke('search-sells', req, currentIndex, amount),
    addProduct: async (product: TNewProduct) => ipcRenderer.invoke('add-product', product),
    addSell: async (sell: TNewSell) => ipcRenderer.invoke('add-sell', sell),
    getProductVariants: async() => ipcRenderer.invoke('get-product-variants')
}

contextBridge.exposeInMainWorld('electronAPI', api)