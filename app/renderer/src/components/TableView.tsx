import React, { useEffect, useRef, useState } from 'react';
import { Translation } from '../types/colums_translation';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Notify } from './Notify';
import { TableViewProps } from '../types/types';
import { loadEntries } from '../tools/api_tools';
import {TProduct, TSell} from '../../../main/src/db/schema'

export function TableView({loadUnit, hint} : TableViewProps) {
    const [renderedEntries, setRenderedEntries] = useState<Array<TProduct | TSell>>([])
    const nextRenderedEntries = useRef<Array<TProduct | TSell>>([])

    const [isLoadPossible, switchLoadPossibility] = useState<boolean>(false);

    const [loadedEntries, setLoadedEntries] = useState<number>(loadUnit);
    const currentLoadIndex = useRef<number>(0)

    const getNewElements = () => {
        var newElements: Array<TProduct | TSell> = loadEntries(loadUnit, hint)
        if (newElements.length === 0){
            switchLoadPossibility(true);
        }
        else{
            currentLoadIndex.current += loadUnit
            return newElements
        }
    }

    useEffect(() => {
        if(renderedEntries.length < loadedEntries){
            nextRenderedEntries.current = getNewElements() || []
        }
        if(nextRenderedEntries.current.length != 0) {
            setRenderedEntries([...renderedEntries, ...nextRenderedEntries.current])
        }
    }, [loadedEntries])

    return (<>
        <Table>
            <TableHead>
                <TableRow>
                    {Object.keys(renderedEntries[0] ? renderedEntries[0] : {} as Object)?.map((value) => <TableCell>{Translation[value as keyof typeof Translation]}</TableCell>)}
                </TableRow>
            </TableHead>
            <TableBody>
                {
                renderedEntries.map((el) => 
                    <TableRow>
                        {
                            Object.keys(el as Object).map((value) => 
                                <TableCell>
                                    {(() => {
                                        var rawValue = el[value as keyof typeof el]
                                        if (typeof rawValue != 'object'){
                                            return rawValue.toString()
                                        }
                                        var date: Date = new Date(rawValue);
                                        if(!isNaN(date.getTime())){
                                            return date.toLocaleDateString('ru-RU')
                                        }
                                    })()}
                                </TableCell>)
                        }
                    </TableRow>
                )}
            </TableBody>
        </Table>
        <Button type='button' onClick={() => setLoadedEntries(loadedEntries + loadUnit)}>Загрузить еще {loadUnit}</Button>
        <Notify active={isLoadPossible} message={'Загрузка невозможна: данных больше нет'} submitListener={() => {switchLoadPossibility(false)}}></Notify>
    </>)
}