import { Input } from "@mui/material"
import { SearchInputProps } from "../types/types"
import { TableView } from "./TableView"
import { useEffect, useState } from "react"

export function SearchTable<T>({placeholder, loadUnit, elementsLoader, exceptions, rowClicked}: SearchInputProps<T>){

    const [searchRequest, setSearchRequest] = useState<string>('')
    const [inputValue, setInputValue] = useState<string>('')

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchRequest(inputValue);
        }, 500); 

        return () => clearTimeout(timer); 
    }, [inputValue]);

    return (<>
        <form onSubmit={(e) => e.preventDefault()} style={{marginBottom: '10px'}}>
            <Input value={inputValue} placeholder={placeholder} onChange={(e) => {setInputValue(e.target.value)}}></Input>
        </form>
        <TableView<T> key={searchRequest} req={searchRequest} loadUnit={loadUnit} exceptions={exceptions} elementsLoader={elementsLoader} rowClicked={rowClicked}></TableView>
    </>)
}