import { Header } from "../components/Header"
import { SearchTable } from "../components/SearchInput"
import { loadSells } from "../api/api_tools"
import { TSell } from "../types/types"
import { routes } from "../types/routes"

export const Sells = ({loadUnit}: {loadUnit: number}) => {

  return (
    <>
      <Header routes={routes}/>
      <SearchTable<TSell> placeholder='Поиск по продажам' exceptions={['product', 'product_id']} loadUnit={loadUnit} elementsLoader={(req: string | null, currentIndex: number, amount: number)=>loadSells(req, currentIndex, amount)}/>
    </>
  )
}