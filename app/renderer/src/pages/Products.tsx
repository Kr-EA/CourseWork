import { Header } from "../components/Header"
import { SearchTable } from "../components/SearchInput"
import { loadProducts } from "../api/api_tools"
import { TProduct } from "../types/types"
import { routes } from "../types/routes"

export const Products = ({loadUnit}: {loadUnit: number}) => {

  return (
    <>
      <Header routes={routes}/>
      <SearchTable<TProduct> placeholder='Поиск по товарам' exceptions={[]} loadUnit={loadUnit} elementsLoader={(req: string | null, currentIndex: number, amount: number)=>loadProducts(req, currentIndex, amount)}/>
    </>
 )
}