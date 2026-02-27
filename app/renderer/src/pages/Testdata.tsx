import { Button, Input } from "@mui/material"
import { Header } from "../components/Header"
import { routes } from "../types/routes"
import { useState } from "react"
import { getRandomProduct } from "../api/notes_generator"

 
 
export const Testdata = () => {

    const [amount, setAmount] = useState<number>(0);

    const productGenerator = (amount: number) => {
        for (let i = 0; i < amount; i=i+1){
            window.electronAPI.addProduct(getRandomProduct())
        }
    }

    return (<>
        <Header routes={routes}></Header>
        <form onSubmit={(e) => {e.preventDefault(); productGenerator(amount)}}>
            <Input value={amount} name="amount" type="number" onChange={(e) => setAmount(e.target.value as any as number)}></Input>
            <Button type="submit">Сгенерировать {amount} продуктов</Button>
        </form>
    </>)
}