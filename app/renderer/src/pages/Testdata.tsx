import { Button, Input, Stack } from "@mui/material"
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

    const productGenerator = async (amount: number) => {
        for (let i = 0; i < amount; i=i+1){
           addProduct(getRandomProduct())
        }
    }

    const sellGenerator = async (amount: number) => {
        for (let i = 0; i < amount; i=i+1){
            addSell(getRandomSell(maxID), true);
        }
    }

    return (<>
        <Header routes={routes}></Header>
        <Stack style={{marginTop: '20px'}} direction={'row'}>
            <form style={{marginRight: '30px', textAlign:'center'}} onSubmit={(e) => {e.preventDefault(); productGenerator(productAmount)}}>
                <h2 style={{marginBottom: '10px'}}>Генерация закупок</h2>
                <Input style={{marginBottom: '10px'}} fullWidth value={productAmount} name="amount" type="number" onChange={(e) => setProductAmount(parseInt(e.target.value, 10))}></Input>
                <Button fullWidth type="submit">Сгенерировать {productAmount || 0} закупок</Button>
            </form>
            <form style={{ textAlign:'center'}} onSubmit={(e) => {e.preventDefault(); sellGenerator(sellAmount)}}>
                <h2 style={{marginBottom: '10px'}}>Генерация продаж</h2>
                <Input style={{marginBottom: '10px'}} fullWidth value={sellAmount} name="amount" type="number" onChange={(e) => setSellAmount(parseInt(e.target.value, 10))}></Input>
                <Button fullWidth type="submit">Сгенерировать {sellAmount || 0} продаж</Button>
            </form>
        </Stack>
    </>)
}