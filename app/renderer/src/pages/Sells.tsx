import { Header } from "../components/Header"
import { SearchTable } from "../components/SearchTable"
import { addSell, getProductVariants, loadSells } from "../api/api_tools"
import { APIResponse, TNewSell, TSell } from "../types/types"
import { routes } from "../types/routes"
import { useFormik } from "formik"
import * as Yup from 'yup'
import { formatDateForInput } from "../api/tools"
import { useEffect, useRef, useState } from "react"
import { Alert, Autocomplete, Button, FormLabel, Input, Stack, TextField } from "@mui/material"

export const Sells = ({loadUnit}: {loadUnit: number}) => {

  const [isAddSelected, setAddSelected] = useState<boolean>(false)
  const [productVariants, setProductVariants] = useState<Array<{id: number, label: string}>>()
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
        .min(1, 'Наименование проданного продукта обязательно для ввода')
        .required('Наименование проданного продукта обязательно для ввода'),
  
      sell_price: Yup.number()
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
          sell_price: '',
          amount: 0,
          sell_date: formatDateForInput(new Date()),
        },
        validationSchema: sellValidationSchema,
        onSubmit: (input) => {
          setAddSelected(false);
          formik.resetForm();
          let sell: TNewSell = {
            sell_date: new Date(input.sell_date),
            sell_price: input.sell_price as any as number,
            amount: input.amount as any as number,
            product_id: input.product_id as any as number,
          };
          addSell(sell).then((response: APIResponse) => {
            if(response.status === 1){
              alert(response.error)
            }
          }).catch((err) => console.log(err))
          console.log('added');
        }
      }
    )

  return (
    <>
      <Header routes={routes}/>
      <Stack>
        <SearchTable<TSell> placeholder='Поиск по продажам' exceptions={['product', 'product_id']} loadUnit={loadUnit} elementsLoader={(req: string | null, currentIndex: number, amount: number)=>loadSells(req, currentIndex, amount)}/>
        <Button onClick={() => {setAddSelected(!isAddSelected); formik.resetForm()}} variant="contained">+</Button>
        <Stack style={{
          'opacity': isAddSelected ? 1 : 0,
          'transition': 'opacity 0.3s ease-in-out'
          }}>
          <form onSubmit={formik.handleSubmit}>
            <div>
              <Autocomplete
                disablePortal
                options={productVariants || []}
                sx={{ width: 300 }}
                onChange={(e, value) => {formik.setFieldValue('product_id', value?.id)}}
                renderInput={(params) => <TextField {...params} label="Выберите товар"/>}
              />
              {formik.touched.product_id && formik.errors.product_id ? (
                <Alert severity="error" style={{ color: 'red' }}>{formik.errors.product_id}</Alert>
              ) : null}
            </div>
            <div>
              <FormLabel htmlFor="sell_price">Стоимость продажи</FormLabel>
              <Input
                id="sell_price"
                name="sell_price"
                type="number"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.sell_price}
              />
              {formik.touched.sell_price && formik.errors.sell_price ? (
                <Alert severity="error" style={{ color: 'red' }}>{formik.errors.sell_price}</Alert>
              ) : null}
            </div>
            <div>
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
            </div>
            <Button type='submit' disabled={formik.isSubmitting} variant="contained">Подтвердить</Button>
          </form>
        </Stack>
      </Stack>
    </>
  )
}