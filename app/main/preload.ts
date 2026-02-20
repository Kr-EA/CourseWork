import { contextBridge, ipcRenderer } from "electron"
import { TSell, TProduct } from "../renderer/src/types/types"

export interface IElectronAPI {
    getProducts: (currentIndex: number, amount: number) => Promise<Array<TProduct>>
    getSells: (currentIndex: number, amount: number) => Promise<Array<TSell>>
    searchProducts: (req: string, currentIndex: number, amount: number) => Promise<Array<TProduct>>
    searchSells: (req: string, currentIndex: number, amount: number) => Promise<Array<{Sell: TSell, Product: TProduct}>>
}

const api: IElectronAPI = {
    getProducts: async (currentIndex: number, amount: number) => ipcRenderer.invoke('get-products', currentIndex, amount),
    getSells: async (currentIndex: number, amount: number) => ipcRenderer.invoke('get-sells', currentIndex, amount),
    searchProducts: async (req: string, currentIndex: number, amount: number) => ipcRenderer.invoke('search-products', req, currentIndex, amount),
    searchSells: async (req: string, currentIndex: number, amount: number) => ipcRenderer.invoke('search-sells', req, currentIndex, amount)
}

contextBridge.exposeInMainWorld('electronAPI', api)