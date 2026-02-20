import { DB_TProduct, DB_TSell, DB_TNewProduct, DB_TNewSell } from "../../../main/src/db/schema"

export interface TableViewProps<T>{
    req: string | null,
    loadUnit: number,
    exceptions: Array<string>,
    elementsLoader: (req: string | null, currentLoadIndex: number, amount: number) => Promise<Array<T>>
}

export interface SearchInputProps<T>{
    placeholder: string;
    loadUnit: number,
    exceptions: Array<string>,
    elementsLoader: (req: string | null, currentLoadIndex: number, amount: number) => Promise<Array<T>>
}

export interface TProduct extends DB_TProduct{};
export interface TSell extends DB_TSell{
    product: TProduct;
    product_name: string;
};
export interface TNewProduct extends DB_TNewProduct{};
export interface TNewSell extends DB_TNewSell{};