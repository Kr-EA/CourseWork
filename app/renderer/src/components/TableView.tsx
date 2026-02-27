import React, { useEffect, useRef, useState } from 'react';
import { Translation } from '../types/colums_translation';
import { Alert, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Notify } from './Notify';
import { TableViewProps } from '../types/types';

export function TableView<T>({ req, loadUnit, elementsLoader, exceptions }: TableViewProps<T>) {
    const [renderedEntries, setRenderedEntries] = useState<Array<T>>([]);
    const [isLoadPossible, switchLoadPossibility] = useState<boolean>(false);
    const [loadedEntries, setLoadedEntries] = useState<number>(loadUnit);
    const [isAlertVisible, setAlertVisible] = useState<boolean>(false)

    const currentLoadIndex = useRef<number>(0);
    const loading = useRef<boolean>(false);

    const getNewElements = async () => {
        const newElements: Array<T> = (await elementsLoader(req, currentLoadIndex.current, loadUnit)).data;
        if (newElements.length === 0) {
            if (!req || currentLoadIndex.current >= 1){
                switchLoadPossibility(true);
            }
            else{
                setAlertVisible(true)
            }
            return [];
        } else {
            currentLoadIndex.current += newElements.length;
            setAlertVisible(false)
            return newElements;
        }
    };

    useEffect(() => {
        setRenderedEntries([]);
        currentLoadIndex.current = 0;
        switchLoadPossibility(false);
        setLoadedEntries(loadUnit);
        loading.current = false;
    }, [req, loadUnit]);

    useEffect(() => {
        const load = async () => {
            if (loading.current) return;
            loading.current = true;
            try {
                const newElements = await getNewElements();
                if (newElements.length > 0) {
                    setRenderedEntries(prev => [...prev, ...newElements]);
                } 
            } catch (err) {
                console.error(err);
            }
            finally{
                loading.current = false;
            }
        };

        if (renderedEntries.length < loadedEntries) {
            load();
        }

        return () => {
            loading.current = false; 
        };
    }, [req, loadedEntries]); 

    const firstEntry = renderedEntries[0];
    const tableHeaders = firstEntry ? Object.keys(firstEntry as Object) : [];

    return (
        <>
            <Alert style={{display: isAlertVisible ? 'flex' : 'none', color: 'red'}} severity="error">{`"${req}" нет в списке!`}</Alert>
            <Table>
                <TableHead>
                    <TableRow>
                        {tableHeaders.map((value) =>
                            !exceptions.find((e) => e === value) ? (
                                <TableCell key={value}>
                                    {Translation[value as keyof typeof Translation] || value.toString()}
                                </TableCell>
                            ) : null
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {renderedEntries.map((el, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Object.keys(el as Object).map((value) =>
                                !exceptions.find((e) => e === value) ? (
                                    <TableCell key={value}>
                                        {(() => {
                                            const rawValue = el[value as keyof typeof el];
                                            const stringRawValue = String(rawValue);
                                            if (typeof rawValue !== 'object') {
                                                return stringRawValue;
                                            }
                                            const date = new Date(stringRawValue);
                                            if (!isNaN(date.getTime())) {
                                                return date.toLocaleDateString('ru-RU');
                                            }
                                        })()}
                                    </TableCell>
                                ) : null
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button 
                type='button' 
                onClick={() => setLoadedEntries(prev => prev + loadUnit)}
            >
                Загрузить еще {loadUnit}
            </Button>
            <Notify 
                active={isLoadPossible} 
                message={'Загрузка невозможна: данных нет'} 
                submitListener={() => switchLoadPossibility(false)}
            />
        </>
    );
}