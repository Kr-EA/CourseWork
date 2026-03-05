import { Box, Button, Input, Paper, Stack } from "@mui/material";
import { Header } from "../components/Header"
import { routes } from "../types/routes"
import { useEffect, useMemo, useRef, useState } from "react";
import { AllProductStats, APIResponse, roundGraphic} from "../types/types";
import { getDistinctProductNames, getProductStats } from "../api/api_tools";
import { useVirtualizer } from '@tanstack/react-virtual';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer, Brush, LineChart, PieChart, Legend, Pie, Cell } from 'recharts';
import { graphics } from "../types/graphics";
import { COLORS } from "../types/colors";

export const Analytics = () => {

  const [productVariants, setProductVariants] = useState<Array<string>>([])
  const [selectedProductVariants, setSelectedProductVariants] = useState<Array<string>>([])
  const [searchSelected, setSearchSelected] = useState<string>('')
  const [searchVariants, setSearchVariants] = useState<string>('')
  const [staticalData, setStaticalData] = useState<AllProductStats>()
  const [range, setRange] = useState({ startIndex: 0, endIndex: 5 });
  const [option, setOption] = useState<string>('Общее')
  const [subOption, setSubOption] = useState<number>(0)

  useEffect(() => {
      const load = async () => {
        const loadedProductVariants: APIResponse = await getDistinctProductNames()
        setProductVariants(loadedProductVariants.data.map((el: {label: string}) => (el.label)))
      }
      load()
  }, [])

  useEffect(() => {
    const load = async () => {
      const response: APIResponse = await getProductStats(selectedProductVariants)
      setStaticalData(response.data)
    }

    load()
    
  }, [selectedProductVariants])

  useEffect(() => {
    console.log(Object.keys(graphics)[subOption]);
  }, [subOption])

  const variantsRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  const filteredVariants = useMemo(() => {
    if (!searchVariants) return productVariants;
    return productVariants.filter(p => 
      p.includes(searchVariants)
    );
  }, [productVariants, searchVariants]);

  const filteredSelected = useMemo(() => {
    if (!searchSelected) return selectedProductVariants;
    return selectedProductVariants.filter(p => 
      p.includes(searchSelected)
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
                const value = e.dataTransfer.getData('variant')
                if(value.length>1){
                  setProductVariants([...productVariants, value].sort((a, b) => (a > b ? 1 : -1)))
                  setSelectedProductVariants([...selectedProductVariants.filter((el) => el!=value)])
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
                    style={{cursor: 'grab', boxShadow:'0px 0px 5px 0px black', borderRadius:'10px', textAlign:'center', margin:'15px', width: '90%', padding: '5px', position: 'absolute', transform: `translateY(${index.start}px)`}} 
                    onDragStart={(e) => {e.dataTransfer.setData('selected', el);}} 
                    key={index.key}>
                      {el}
                  </div> 
              )
            })}
          </Stack>
        </Paper>
      </Stack>

      <Stack direction={'column'} style={{marginRight: '20px'}}>
        <Input style={{position: 'fixed', backgroundColor: 'background.paper', width: window.outerWidth*0.15}} value={searchSelected} onChange={(e) => setSearchSelected(e.target.value)} placeholder="Поиск по выбранному"></Input>
        <Paper ref={selectedRef} style={{marginTop: '50px', overflowY: 'auto', height: window.outerHeight*0.85, width: window.outerWidth*0.15}}
            onDragOver={(e) => e.preventDefault()}
            onDrop={
              (e) => {
                e.preventDefault(); 
                const value = e.dataTransfer.getData('selected')
                if(value.length > 1){
                  setSelectedProductVariants([...selectedProductVariants, value].sort((a, b) => (a > b ? 1 : -1)))
                  setProductVariants([...productVariants.filter((el) => el!=value)])
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
                    onDragStart={(e) => {e.dataTransfer.setData('variant', el);}} 
                    key={index.key}>
                      {el}
                  </div> 
                )
              })}
          </Stack>
        </Paper>
      </Stack>


      { 

      staticalData?.sells_by_product && staticalData?.sells_by_product.length > 0 ?
        
      <Stack style={{maxWidth: window.outerWidth*0.7, width: window.outerWidth*0.7}} direction={'column'}>
        <Paper  style={{overflowX: 'auto', maxHeight: '50px', maxWidth: window.outerWidth*0.7,}}>
            <Stack direction={'row'} style={{flexShrink: 0, width: window.outerWidth*0.6,}}>
              <Button variant={option === 'Общее' ? 'contained' : 'text'} style={{width: '100px', height: '50px', flexShrink: 0}} onClick={() => (setOption('Общее'))}>Общее</Button>
              {staticalData.sells_by_product.map((el) => (
                  <Button variant={option === el.product_name ? 'contained' : 'text'} onClick={() => (setOption(el.product_name))} key={el.product_name} style={{width: '100px', height: '50px', flexShrink: 0}}>{el.product_name}</Button>
              ))}
            </Stack>
        </Paper> 
        <Paper style={{width: '100%', height: '100%', overflowX: 'auto', maxWidth: window.outerWidth*0.7}}>
          {
            (() => {
              if (option === 'Общее'){
                const validData = staticalData?.sells_by_product?.filter(
                  item => item.sells_amount !== undefined && item.sells_amount !== null && !isNaN(item.sells_amount)
                ) || [];

                if (validData.length === 0) {
                  return <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400}}>Нет данных для отображения</Box>;
                }
                return (
                  <>
                    <Box textAlign={'center'}>
                      <h1>Продажи продуктов</h1>
                    </Box>
                    <ResponsiveContainer width="100%" height="95%">
                      <BarChart data={validData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="product_name" textAnchor="end" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sells_amount" fill="#8884d8" />
                        <Brush 
                          dataKey="product_name" 
                          height={30} 
                          stroke="#8884d8"
                          tickFormatter={() => ''}
                          startIndex={Math.min(range.startIndex, validData.length - 1)}
                          endIndex={Math.min(range.endIndex, validData.length - 1)}
                          onChange={(newRange) => setRange(newRange)}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}
              const data = staticalData.product_stats.find((el) => el.name == option)
              const valueKey = graphics[subOption]
                switch (valueKey){
                  case 'sells_by_days':
                    return(
                      <>
                        <Stack width={window.outerWidth*0.65} direction={'row'} justifyContent={'space-between'}>
                          <Button fullWidth onClick={() => {if(subOption-1 >= 0) {setSubOption(subOption-1)} else {setSubOption(Object.keys(graphics).length-1)}}}>{'<'}</Button>
                          <Button fullWidth onClick={() => {if(subOption+1 < Object.keys(graphics).length) {setSubOption(subOption+1)} else {setSubOption(0)}}}>{'>'}</Button>
                        </Stack>
                        <Box textAlign={'center'}>
                          <h1>Объем продаж продукта по дням</h1>
                        </Box>
                        <ResponsiveContainer width="100%" height="90%">
                          <LineChart data={data?.sells_by_days}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={`day`} textAnchor="end"/>
                            <YAxis/>
                            <Line dataKey={`sells_amount`} stroke="#534dc1"></Line>
                            <Tooltip />
                          </LineChart>
                        </ResponsiveContainer>
                      </>
                    )
                  case 'sells_by_prices':
                    return(
                      <>
                        <Stack width={window.outerWidth*0.65} direction={'row'} justifyContent={'space-between'}>
                          <Button fullWidth onClick={() => {if(subOption-1 >= 0) {setSubOption(subOption-1)} else {setSubOption(Object.keys(graphics).length-1)}}}>{'<'}</Button>
                          <Button fullWidth onClick={() => {if(subOption+1 < Object.keys(graphics).length) {setSubOption(subOption+1)} else {setSubOption(0)}}}>{'>'}</Button>
                        </Stack>
                        <Box textAlign={'center'}>
                          <h1>Объем продаж продукта по цене</h1>
                        </Box>
                        <ResponsiveContainer width="100%" height="90%">
                          <BarChart data={data?.sells_by_prices}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={`price`} textAnchor="end"/>
                            <YAxis/>
                            <Line dataKey={`sells_amount`} stroke="#534dc1"></Line>
                            <Tooltip />
                            <Bar dataKey={`sells_amount`} fill="#8884d8"/>
                          </BarChart>
                        </ResponsiveContainer>
                      </>
                    )
                  case 'bought_prices_by_day':
                    return (
                      <>
                        <Stack width={window.outerWidth*0.65} direction={'row'} justifyContent={'space-between'}>
                          <Button fullWidth onClick={() => {if(subOption-1 >= 0) {setSubOption(subOption-1)} else {setSubOption(Object.keys(graphics).length-1)}}}>{'<'}</Button>
                          <Button fullWidth onClick={() => {if(subOption+1 < Object.keys(graphics).length) {setSubOption(subOption+1)} else {setSubOption(0)}}}>{'>'}</Button>
                        </Stack>
                        <Box textAlign={'center'}>
                          <h1>Стоимость закупки продукта по дням</h1>
                        </Box>
                        <ResponsiveContainer width="100%" height="90%">
                          <LineChart data={data?.bought_prices_by_day}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={`day`} textAnchor="end"/>
                            <YAxis />
                            <Line dataKey={`bought_price`} stroke="#534dc1"></Line>
                            <Tooltip />
                          </LineChart>
                        </ResponsiveContainer>
                      </>
                    )
                  default:
                    const pieData = [{name: 'В день закупки', value: data?.sells_percent.sells_on_bought_date}, {name: 'В другие дни', value: data?.sells_percent.sells_amount}, {name: 'Остаток', value: data?.sells_percent.remainder}]
                    return (
                    <>
                        <Stack width={window.outerWidth*0.65} direction={'row'} justifyContent={'space-between'}>
                          <Button fullWidth onClick={() => {if(subOption-1 >= 0) {setSubOption(subOption-1)} else {setSubOption(Object.keys(graphics).length-1)}}}>{'<'}</Button>
                          <Button fullWidth onClick={() => {if(subOption+1 < Object.keys(graphics).length) {setSubOption(subOption+1)} else {setSubOption(0)}}}>{'>'}</Button>
                        </Stack>
                        <Box textAlign={'center'}>
                          <h1>Распределение продаж</h1>
                        </Box>
                        <ResponsiveContainer width="100%" height="90%">
                          <PieChart data={data?.bought_prices_by_day}>
                            <Legend />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={300}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </>
                    )
                }
            })()
          }
        </Paper>
      </Stack>

      :

      <Stack style={{width: '100%', alignItems: 'center', justifyContent: 'center'}} direction={'column'}>
        <h2>Выберите товары для анализа</h2>
      </Stack>

      }

    </Stack> 
  </>)
}