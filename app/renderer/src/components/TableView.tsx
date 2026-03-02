import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Translation } from '../types/colums_translation';
import { Alert, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { Notify } from './Notify';
import { ScrollContainerProps, TableViewProps } from '../types/types';
import { getComparator } from '../api/tools';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import React from 'react';

const ScrollContainer = React.forwardRef<HTMLDivElement, ScrollContainerProps>(
    ({ onReachBottom, ...props }, ref) => {
        useEffect(() => {
            const element = (ref as {current: HTMLDivElement})?.current;
            if (!element || !onReachBottom) return;

            const handleScroll = () => {
                const { scrollTop, clientHeight, scrollHeight } = element;

                if (Math.abs(scrollHeight - scrollTop - clientHeight) < 1) {
                    onReachBottom();
                }
            };

            element.addEventListener('scroll', handleScroll);
            return () => element.removeEventListener('scroll', handleScroll);
        }, [ref, onReachBottom]);

        return (
            <TableContainer
                component={Paper}
                {...props}
                ref={ref}
                sx={{ height: '100%', maxHeight: '100%' }}
            />
        );
    }
);

ScrollContainer.displayName = 'ScrollContainer';

export function TableView<T>({ req, loadUnit, elementsLoader, exceptions, rowClicked }: TableViewProps<T>) {
    const [renderedEntries, setRenderedEntries] = useState<Array<T>>([]);
    const [isLoadPossible, switchLoadPossibility] = useState<boolean>(false);
    const [loadedEntries, setLoadedEntries] = useState<number>(loadUnit);
    const [isAlertVisible, setAlertVisible] = useState<boolean>(false);
    const [orderBy, setOrderBy] = useState<keyof T>();
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');

    const currentLoadIndex = useRef<number>(0);
    const loading = useRef<boolean>(false);
    const tableRef = useRef<HTMLElement>(null);

    const handleReachBottom = useCallback(() => {
        setLoadedEntries(prev => prev + loadUnit);
    }, [loadUnit]);

    const sortedData = useMemo(() => {
        if (!orderBy) return renderedEntries;
        return [...renderedEntries].sort(getComparator({ order, orderBy }));
    }, [renderedEntries, orderBy, order]);

    const VirtuosoTableComponents = useMemo<TableComponents<T>>(() => ({
        Scroller: (props) => (
            <ScrollContainer 
                {...props} 
                onReachBottom={handleReachBottom} 
            />
        ),
        Table: (props) => (
            <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
        ),
        TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
            <TableHead {...props} ref={ref} />
        )),
        TableRow,
        TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
            <TableBody {...props} ref={ref} />
        )),
    }), [handleReachBottom]);

    const handleSort = (value: keyof T) => {
        const isAsc = orderBy === value && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(value);
    }

    const getNewElements = async () => {
        const newElements: Array<T> = (await elementsLoader(req, currentLoadIndex.current, loadUnit)).data;
        if (newElements.length === 0) {
            if (!(!req || currentLoadIndex.current >= 1)){
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

    useEffect(() => {
        const element = tableRef.current;
        if (!element) return;

        const handleScroll = () => {
        const { scrollTop, clientHeight, scrollHeight } = element;

        if (Math.abs(scrollHeight - scrollTop - clientHeight) < 1) {
            console.log('Доскроллили до низа элемента!');
        }
        };

        element.addEventListener('scroll', handleScroll);
        return () => element.removeEventListener('scroll', handleScroll);
    }, []);


    const firstEntry = renderedEntries[0];
    const tableHeaders = firstEntry ? Object.keys(firstEntry as Object) : [];

    const tableHead = () => (
        (
        <TableRow sx={{ backgroundColor: 'background.paper' }}>
            {tableHeaders.map((value) =>
                !exceptions.find((e) => e === value) ? (
                    <TableCell variant='head' key={value} sortDirection={orderBy === value as keyof T ? order : false}>
                        <TableSortLabel
                        active={orderBy === value as keyof T}
                        direction={orderBy === value as keyof T ? order : 'asc'}
                        onClick={() =>{handleSort(value as keyof T)}}
                        >
                            {Translation[value as keyof typeof Translation] || value.toString()}
                        </TableSortLabel>
                    </TableCell>
                ) : null
            )}
        </TableRow>)
    )

    const TRow = (index: number, el: T) => {
        return(
            <React.Fragment key={index}>
                {Object.keys(el as Object).map((value) =>
                    !exceptions.find((e) => e === value) ? (
                        <TableCell onClick={() => {rowClicked(el)}} key={value}>
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
            </React.Fragment>
        )
    }

    return (
        <>
            <Alert style={{display: isAlertVisible ? 'flex' : 'none', color: 'red'}} severity="error">{`"${req}" нет в списке!`}</Alert>
            <Paper style={{ height: window.innerHeight*0.8, width: '100%', overflow: 'hidden' }}>
                <TableVirtuoso
                    data={sortedData}
                    components={VirtuosoTableComponents}
                    fixedHeaderContent={tableHead}
                    itemContent={TRow}
                    onScrollEnd={() => {}}
                />
            </Paper>
        </>
    );
}