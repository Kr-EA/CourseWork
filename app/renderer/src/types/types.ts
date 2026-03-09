import { FormikConfig } from "formik";
import { DB_TProduct, DB_TSell, DB_TNewProduct, DB_TNewSell } from "../../../main/src/db/schema"
import * as Yup from 'yup'
import { JSX } from "react";
//types

export type APIResponse = {
    status: 0 | 1;
    data: any;
    error: string;
}

//React Components` props params
export interface TableViewProps<T>{
    req: string | null,
    loadUnit: number,
    columnOrder?: Array<string> | undefined,
    exceptions: Array<string>,
    elementsLoader: (req: string | null, currentLoadIndex: number, amount: number) => Promise<APIResponse>
    onRepeat: (el: T) => void
    onChange: (el: T) => void
    onDelete: (el: T) => void
}
export interface SearchInputProps<T>{
    placeholder: string;
    loadUnit: number,
    columnOrder?: Array<string>,
    exceptions: Array<string>,
    elementsLoader: (req: string | null, currentLoadIndex: number, amount: number) => Promise<APIResponse>
    onRepeat: (el: T) => void
    onChange: (el: T) => void
    onDelete: (el: T) => void
}
export interface HeaderProps{
    routes: Array<{title: string, path: string}>
}
export interface ScrollContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    onReachBottom?: () => void;
}

//tools dependencies
export interface ElementsComparation<T>{
    a: T,
    b: T,
    orderBy: keyof T;
}

export interface FieldSortParams<T>{
    orderBy: keyof T;
    order: 'desc' | 'asc';
}

//DB exported types

export interface TProduct extends DB_TProduct{};
export interface TSell extends DB_TSell{
    product: TProduct;
    product_name: string;
};
export interface TNewProduct extends DB_TNewProduct{};
export interface TNewSell extends DB_TNewSell{};

//DB inner types
export type OneProductStats = {
    name: string;
    sells_by_days: {
        day: string,
        sells_amount: number | undefined,
        predict_sells_amount: number | undefined
    }[],
    sells_by_prices: {
        price: number,
        sells_amount: number,
    }[],
    bought_prices_by_day: {
        day: string,
        bought_price: number,
    }[],
    sells_percent: {
        sells_on_bought_date: number,
        sells_amount: number,
        remainder: number,
    }
}

export type roundGraphic = {
    sells_on_bought_date: number, 
    sells_amount: number,
    remainder: number
}

export type AllProductStats = {
    product_stats: OneProductStats[],
    sells_by_product: {
        product_name: string,
        sells_amount: number,
    }[]
}