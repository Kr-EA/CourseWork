import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Translation } from '../types/colums_translation';
import { Alert, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';
import RepeatIcon from '@mui/icons-material/Repeat';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { ScrollContainerProps, TableViewProps } from '../types/types';
import { getComparator } from '../api/tools';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import React from 'react';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { alertBgColor, alertFontColor, defaultBgColor, defaultFontColor, iconsAlertColor, iconsDefaultColor } from '../types/colors';

const ScrollContainer = React.forwardRef<HTMLDivElement, ScrollContainerProps>(
    ({ onReachBottom, ...props }, ref) => {
        useEffect(() => {
            const element = (ref as {current: HTMLDivElement})?.current;
            if (!element || !onReachBottom) return;

            const handleScroll = () => {
                const { scrollTop, clientHeight, scrollHeight } = element;
                if (Math.abs(scrollHeight - scrollTop - clientHeight) <= 1) {
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

export function TableView<T>({ req, loadUnit, elementsLoader, columnOrder, exceptions, onChange, onRepeat, onDelete }: TableViewProps<T>) {
    const [renderedEntries, setRenderedEntries] = useState<Array<T>>([]);
    const [loadedEntries, setLoadedEntries] = useState<number>(loadUnit);
    const [isAlertVisible, setAlertVisible] = useState<boolean>(false);
    const [orderBy, setOrderBy] = useState<keyof T>();
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');

    const currentLoadIndex = useRef<number>(0);
    const loading = useRef<boolean>(false);

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
            <Table  {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
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

    useEffect(() => {
        setRenderedEntries([]);
        currentLoadIndex.current = 0;
        setLoadedEntries(loadUnit);
        loading.current = false;
    }, [req, loadUnit]);

    useEffect(() => {
        if (renderedEntries.length < loadedEntries) {
            load();
        }
        return () => {
            loading.current = false; 
        };
    }, [req, loadedEntries]); 

    const firstEntry = renderedEntries[0];
    const tableHeaders = firstEntry ? Object.keys(firstEntry as Object) : [];

    const tableHead = () => (
        (
        <TableRow sx={{ backgroundColor: iconsDefaultColor }}>
            {(columnOrder || tableHeaders).map((value) =>
                !exceptions.find((e) => e === value) ? (
                    <TableCell style={{border: '0.5px solid lightgrey'}} align='center' variant='head' key={value} sortDirection={orderBy === value as keyof T ? order : false}>
                        <TableSortLabel
                            active={orderBy === value as keyof T}
                            direction={orderBy === value as keyof T ? order : 'asc'}
                            onClick={() => handleSort(value as keyof T)}
                            IconComponent={() => null}
                            sx={{
                                color: 'white',
                                '&:hover .custom-sort-icon': {
                                    opacity: 1,
                                }
                            }}
                        >
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, width: '100%' }}>
                            {Translation[value as keyof typeof Translation] || value.toString()}
                            {
                                orderBy === value as keyof T ?
                                    order === 'desc'?
                                        <ArrowUpward
                                            sx={{ 
                                                fontSize: '1rem'
                                            }} 
                                        />
                                    :
                                        <ArrowDownward
                                            sx={{ 
                                                fontSize: '1rem'
                                            }} 
                                        />
                                :
                                <></>
                            }
                        </Box>
                    </TableSortLabel>
                </TableCell>
                ) : null
            )}
            <TableCell style={{color: 'white', border: '0.5px solid lightgrey', width: '300px'}} align='center'>
                Действия
            </TableCell>
        </TableRow>)
    )

    const TRow = (index: number, el: T) => {
        var bgColor = defaultBgColor
        var iconColor = iconsDefaultColor
        var fontColor = defaultFontColor
        Object.keys(el as Object).forEach((key) => {
            if (el[key as keyof typeof el] == 0){
                bgColor = alertBgColor
                iconColor = iconsAlertColor
                fontColor = alertFontColor
            }
        })
        return(
            <React.Fragment key={index}>
                {(columnOrder || Object.keys(el as Object)).map((key) => {
                    const rawValue = el[key as keyof typeof el]
                    if (rawValue || rawValue == 0){
                        return(
                            <TableCell style={{fontWeight: rawValue == 0 ? 'bold' : 0,  color: fontColor, backgroundColor: bgColor, border: '0.5px solid lightgrey'}} align={typeof(rawValue) == 'string' ? "center" : 'right'} key={Math.random()}>
                            {(() => {
                                const stringRawValue = String(rawValue);
                                if (typeof rawValue !== 'object') {
                                    if (typeof rawValue == 'number'){
                                        if (rawValue != 0){
                                            const display = (Math.floor(rawValue*100)/100).toString()
                                            return(display)
                                        }
                                        else{
                                            return('0')
                                        }
                                    }
                                    return stringRawValue;
                                }
                                const date = new Date(stringRawValue);
                                if (!isNaN(date.getTime())) {
                                    return date.toLocaleDateString('ru-RU');
                                }
                            })()}
                            </TableCell>
                        )
                    }
                    else{
                        return (
                            <></>
                        )
                    }
                })}
            <TableCell style={{backgroundColor: bgColor, border: '0.5px solid lightgrey'}} align='center'>
                <Button onClick={() => {onRepeat(el)}}><RepeatIcon style={{color: iconColor}}/></Button>
                <Button onClick={() => {onDelete(el)}}><DeleteIcon style={{color: iconColor}}/></Button>
                <Button onClick={() => {onChange(el)}}><ModeEditIcon style={{color: iconColor}}/></Button>
            </TableCell>
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
                />
            </Paper>
        </>
    );
}