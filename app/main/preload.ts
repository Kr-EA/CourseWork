import { contextBridge, ipcRenderer } from "electron"

export interface IElectronAPI {
}

const api: IElectronAPI = {
    //ipcRenderer.invoke('signal')
}

contextBridge.exposeInMainWorld('electronAPI', api)