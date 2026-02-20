import React, { useEffect } from 'react';
import { TableView } from './components/TableView';
import { TProduct, TSell } from './types/types';
import { loadProducts, loadSells } from './tools/api_tools';
import { SearchTable } from './components/SearchInput';

const ProductsView = ({loadUnit}: {loadUnit: number}) => {
  return (
    <>
      <SearchTable<TProduct> placeholder='Поиск по товарам' exceptions={[]} loadUnit={loadUnit} elementsLoader={(req: string | null, currentIndex: number, amount: number)=>loadProducts(req, currentIndex, amount)}/>
    </>
 )
}

const SellsView = ({loadUnit}: {loadUnit: number}) => {
  return (
    <>
      <SearchTable<TSell> placeholder='Поиск по продажам' exceptions={['product', 'product_id']} loadUnit={loadUnit} elementsLoader={(req: string | null, currentIndex: number, amount: number)=>loadSells(req, currentIndex, amount)}/>
    </>
  )
}

const App: React.FC = () => {
  return (<>
    <ProductsView loadUnit={3}/>
    <SellsView loadUnit={3}/>
  </>);
};

export default App;