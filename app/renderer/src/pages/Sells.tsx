import { Header } from "../components/Header"
import { SearchTable } from "../components/SearchTable"
import { addSell, changeSell, deleteSell, getProductVariants, loadSells } from "../api/api_tools"
import { APIResponse, TNewSell, TSell } from "../types/types"
import { routes } from "../types/routes"
import { useFormik } from "formik"
import * as Yup from 'yup'
import { formatDateForInput } from "../api/tools"
import { useEffect, useRef, useState } from "react"
import { Alert, Autocomplete, Button, Container, Dialog, FormLabel, Input, Stack, TextField } from "@mui/material"

export const Sells = ({loadUnit}: {loadUnit: number}) => {

  const [isAddSelected, setAddSelected] = useState<boolean>(false)
  const [productVariants, setProductVariants] = useState<Array<{id: number, label: string}>>()
  const [isSubmitNecessary, setIsSubmitNecessary] = useState<boolean>(false)
  const [tableReload, setTableReload] = useState<number>(1)
  const [currentElement, setCurrentElement] = useState<TSell>()
  const [isChange, setIsChange] = useState<boolean>(false)
  const isVariantsLoaded = useRef<boolean>(false)

  useEffect(() => {
    if (isAddSelected && !isVariantsLoaded.current){
      const load = async () => {
        const loadedProductVariants: APIResponse = await getProductVariants()
        setProductVariants(loadedProductVariants.data.map((el: {id: number, name: string, bought_date: Date}) => ({id: el.id, label: `${el.name} (${formatDateForInput(el.bought_date)})`})))
      }
      load()
      isVariantsLoaded.current = true
    }
  }, [isAddSelected])

  const sellValidationSchema = Yup.object({
      product_id: Yup.number()
        .min(1, 'Наименование продукта обязательно для ввода')
        .required('Наименование продукта обязательно для ввода'),
  
      sell_unit_price: Yup.number()
        .typeError('Цена должна быть числом')
        .min(0, 'Цена не может быть отрицательной')
        .required('Цена продажи обязательна для ввода'),

      amount: Yup.number()
        .typeError('Количество должно быть числом')
        .min(1, 'Количество не может быть меньше 1')
        .required('Количество обязательно для ввода'),
  
      sell_date: Yup.date()
        .typeError('Некорректная дата')
        .max(new Date(), 'Дата продажи не может быть в будущем')
        .required('Дата продажи обязательна для ввода'),
    });
  
    const formik = useFormik({
        initialValues: {
          product_id: 0,
          product_name: {id: 0, label: ''},
          sell_unit_price: '',
          amount: 0,
          sell_date: formatDateForInput(new Date()),
        },
        validationSchema: sellValidationSchema,
        onSubmit: (input) => {
          setAddSelected(false);
          setTableReload(tableReload*(-1))
          formik.resetForm();
          let sell: TNewSell = {
            sell_date: new Date(new Date(input.sell_date).setHours(0, 0, 0, 0)),
            sell_unit_price: parseInt(input.sell_unit_price, 10),
            amount: input.amount,
            product_id: input.product_id,
          };
          if (!isChange){
            addSell(sell, false).then((response: APIResponse) => {
              if(response.status === 1){
                alert(response.error)
              }
            }).catch((err) => console.log(err))
          }
          else{
            changeSell({...sell, id: currentElement?.id} as TSell).then((response: APIResponse) => {
              if(response.status === 1){
                alert(response.error)
                return
              }
              setIsChange(false)
              setTableReload(tableReload*(-1))
              console.log(sell);
            }).catch((err) => console.log(err))
          }
        }
      }
    )

  return (
    <>
      <Header routes={routes}/>
      <Stack>
          <SearchTable<TSell> 
            placeholder='Поиск по продажам' 
            exceptions={[]} 
            columnOrder={['sell_date', 'product_name', 'sell_unit_price', 'amount', 'sell_price']}
            loadUnit={loadUnit} 
            key={tableReload}
            elementsLoader={
              (req: string | null, currentIndex: number, amount: number)=>loadSells(req, currentIndex, amount)
              }
            onRepeat={(el) => {
              setAddSelected(true); 
              formik.setFieldValue('product_name', el.product_name);
              formik.setFieldValue('product_id', el.product_id); 
              formik.setFieldValue('sell_unit_price', el.sell_unit_price);
            }}
            onChange={(el) => {
              setAddSelected(true);
              setCurrentElement(el)
              formik.setFieldValue('product_name', el.product_name);
              formik.setFieldValue('product_id', el.product_id); 
              formik.setFieldValue('sell_unit_price', el.sell_unit_price);
              formik.setFieldValue('sell_date', el.sell_date);
              formik.setFieldValue('amount', el.amount)
              setIsChange(true);
            }}
            onDelete={(el) => {
              setCurrentElement(el)
              setIsSubmitNecessary(true)
            }}
              />
        <Button style={{marginTop: '30px'}} onClick={() => {setAddSelected(!isAddSelected); formik.resetForm()}} variant="contained">+</Button>
        <Stack style={{
          'opacity': isAddSelected ? 1 : 0,
          'transition': 'opacity 0.3s ease-in-out'
          }}>
          <Dialog open={isAddSelected}>
            <form onSubmit={formik.handleSubmit} style={{minWidth: 500, minHeight: 250, padding: '5px'}}>
              <Stack direction={'column'} justifyContent={'space-between'} style={{height: '100%'}}>
                <Stack direction={'column'}>
                  <Autocomplete
                    disablePortal
                    value={formik.values.product_name}
                    options={productVariants || []}
                    onChange={(e, value) => {formik.setFieldValue('product_id', value?.id); formik.setFieldValue('product_name', value?.label)}}
                    renderInput={(params) => <TextField {...params} label="Выберите товар"/>}
                  />
                  {formik.touched.product_id && formik.errors.product_id ? (
                    <Alert severity="error" style={{ color: 'red' }}>{formik.errors.product_id}</Alert>
                  ) : null}
                </Stack>
                <Stack direction={'column'}>
                  <FormLabel htmlFor="sell_unit_price">Стоимость за единицу</FormLabel>
                  <Input
                    id="sell_unit_price"
                    name="sell_unit_price"
                    type="number"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.sell_unit_price}
                  />
                  {formik.touched.sell_unit_price && formik.errors.sell_unit_price ? (
                    <Alert severity="error" style={{ color: 'red' }}>{formik.errors.sell_unit_price}</Alert>
                  ) : null}
                </Stack>
                <Stack direction={'column'}>
                  <FormLabel htmlFor="amount">Количество проданной продукции</FormLabel>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.amount}
                  />
                  {formik.touched.amount && formik.errors.amount ? (
                    <Alert severity="error" style={{ color: 'red' }}>{formik.errors.amount}</Alert>
                  ) : null}
                </Stack>
                <Stack direction={'column'} style={{marginTop: '5px'}}>
                  <Button fullWidth style={{marginBottom: '5px'}} type='submit' disabled={formik.isSubmitting} variant="contained">Подтвердить</Button>
                  <Button fullWidth onClick={() => setAddSelected(false)} variant="contained">Отмена</Button>
                </Stack>
              </Stack>
            </form>
          </Dialog>
          <Dialog open={isSubmitNecessary}>
            <Stack style={{padding: '10px'}}>
            <h2 style={{marginBottom: '20px'}}>Вы уверены?</h2>
            <Button style={{marginBottom: '5px'}} variant="contained" onClick={() => {if (currentElement) {deleteSell(currentElement); setTableReload(tableReload*(-1)); setIsSubmitNecessary(false)}}}>Подтвердить</Button>
            <Button variant="contained" onClick={() => setIsSubmitNecessary(false)}>Отмена</Button>
            </Stack>
          </Dialog>
        </Stack>
      </Stack>
    </>
  )
}