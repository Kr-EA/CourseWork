import { Button, Input } from "@mui/material"
import { Header } from "../components/Header"
import { routes } from "../types/routes"
import { useEffect, useState } from "react"
import { getRandomProduct, getRandomSell } from "../api/notes_generator"
import { addProduct, addSell, getMaximumProductID } from "../api/api_tools"

export const Testdata = () => {

    const [productAmount, setProductAmount] = useState<number>(0);
    const [sellAmount, setSellAmount] = useState<number>(0);
    const [maxID, setMaxID] = useState<number>(0);

    useEffect(() => {
        const load = async () => (await getMaximumProductID())
        load().then((response) => setMaxID(response.data as number))
    })

    const productGenerator = (amount: number) => {
        for (let i = 0; i < amount; i=i+1){
           addProduct(getRandomProduct())
        }
    }

    const sellGenerator = (amount: number) => {
        for (let i = 0; i < amount; i=i+1){
            addSell(getRandomSell(maxID), true);
        }
    }

    return (<>
        <Header routes={routes}></Header>
        <h1>Генерация закупок</h1>
        <form onSubmit={(e) => {e.preventDefault(); productGenerator(productAmount)}}>
            <Input value={productAmount} name="amount" type="number" onChange={(e) => setProductAmount(parseInt(e.target.value, 10))}></Input>
            <Button type="submit">Сгенерировать {productAmount} закупок</Button>
        </form>
        <h1>Генерация продаж</h1>
        <form onSubmit={(e) => {e.preventDefault(); sellGenerator(sellAmount)}}>
            <Input value={sellAmount} name="amount" type="number" onChange={(e) => setSellAmount(parseInt(e.target.value, 10))}></Input>
            <Button type="submit">Сгенерировать {sellAmount} продаж</Button>
        </form>
    </>)
}