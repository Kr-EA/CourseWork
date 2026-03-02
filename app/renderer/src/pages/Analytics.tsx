import { Input, Paper, Stack } from "@mui/material";
import { Header } from "../components/Header"
import { routes } from "../types/routes"
import { useEffect, useMemo, useRef, useState } from "react";
import { APIResponse } from "../types/types";
import { getDistinctProductNames } from "../api/api_tools";
import { useVirtualizer } from '@tanstack/react-virtual';

export const Analytics = () => {

  const [productVariants, setProductVariants] = useState<Array<{id: number, label: string}>>([])
  const [selectedProductVariants, setSelectedProductVariants] = useState<Array<{id: number, label: string}>>([])
  const [searchSelected, setSearchSelected] = useState<string>('')
  const [searchVariants, setSearchVariants] = useState<string>('')

  useEffect(() => {
      const load = async () => {
        const loadedProductVariants: APIResponse = await getDistinctProductNames()
        setProductVariants(loadedProductVariants.data.map((el: {id: number, name: string}) => ({id: el.id, label: el.name})))
      }
      load()
  }, [])

  const variantsRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  const filteredVariants = useMemo(() => {
    if (!searchVariants) return productVariants;
    return productVariants.filter(p => 
      p.label.includes(searchVariants)
    );
  }, [productVariants, searchVariants]);

  const filteredSelected = useMemo(() => {
    if (!searchSelected) return selectedProductVariants;
    return selectedProductVariants.filter(p => 
      p.label.includes(searchSelected)
    );
  }, [selectedProductVariants, searchSelected]);

  const variantsVirtualizer = useVirtualizer({
    count: filteredVariants.length,
    getScrollElement: () => variantsRef.current,
    estimateSize: () => 39.5,
    overscan: 1,
  });

  const selectedVirtualizer = useVirtualizer({
    count: filteredSelected.length,
    getScrollElement: () => selectedRef.current,
    estimateSize: () => 39.5,
    overscan: 1,
  });

  return(<>
    <Header routes={routes}/>
    <Stack direction={'row'}>
      <Stack direction={'column'} style={{marginRight: '20px'}}>
        <Input style={{position: 'fixed', backgroundColor: 'background.paper', width: window.outerWidth*0.15}} value={searchVariants} onChange={(e) => setSearchVariants(e.target.value)} placeholder="Поиск по товарам"></Input>
        <Paper ref={variantsRef} style={{marginTop: '50px', overflowY: 'auto', height: window.outerHeight*0.85, width: window.outerWidth*0.15}}
            onDragOver={(e) => e.preventDefault()}
            onDrop={
              (e) => {
                e.preventDefault(); 
                const value = e.dataTransfer.getData('variant').split('$%$')
                if(value.length>1){
                  const id = parseInt(value[0], 10);
                  const label = value[1]
                  const element = {id, label}
                  setProductVariants([...productVariants, element].sort((a, b) => (a.label > b.label ? 1 : -1)))
                  setSelectedProductVariants([...selectedProductVariants.filter((el) => el.id!=element.id)])
                }
              }}>
          <Stack 
            direction={'column'} 
            style={{height: variantsVirtualizer.getTotalSize(), position: 'relative'}}>
            {variantsVirtualizer.getVirtualItems().map((index) => {
              const el = filteredVariants[index.index];
              return(
                  <div 
                    draggable='true' 
                    style={{padding: '10px', position: 'absolute', transform: `translateY(${index.start}px)`}} 
                    onDragStart={(e) => {e.dataTransfer.setData('selected', el.id.toString() + '$%$' + el.label);}} 
                    key={index.key}>
                      {el.label}
                  </div> 
              )
            })}
          </Stack>
        </Paper>
      </Stack>

      <Stack direction={'column'}>
        <Input style={{position: 'fixed', backgroundColor: 'background.paper', width: window.outerWidth*0.15}} value={searchSelected} onChange={(e) => setSearchSelected(e.target.value)} placeholder="Поиск по выбранному"></Input>
        <Paper ref={selectedRef} style={{marginTop: '50px', overflowY: 'auto', height: window.outerHeight*0.85, width: window.outerWidth*0.15}}
            onDragOver={(e) => e.preventDefault()}
            onDrop={
              (e) => {
                e.preventDefault(); 
                const value = e.dataTransfer.getData('selected').split('$%$')
                if(value.length > 1){
                  const id = parseInt(value[0], 10);
                  const label = value[1]
                  const element = {id, label}
                  setSelectedProductVariants([...selectedProductVariants, element].sort((a, b) => (a.label > b.label ? 1 : -1)))
                  setProductVariants([...productVariants.filter((el) => el.id!=element.id)])
                }
              }}>
          <Stack 
            direction={'column'}
            style={{height: selectedVirtualizer.getTotalSize(), position: 'relative'}}>
            {selectedVirtualizer.getVirtualItems().map((index) => {
                const el = filteredSelected[index.index]
                return(
                  <div 
                    draggable='true' 
                    style={{padding: '10px', position: 'absolute', transform: `translateY(${index.start}px)`}} 
                    onDragStart={(e) => {e.dataTransfer.setData('variant', el.id.toString() + '$%$' + el.label);}} 
                    key={index.key}>
                      {el.label}
                  </div> 
                )
              })}
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  </>)
}