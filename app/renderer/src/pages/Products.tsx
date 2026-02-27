import { Header } from "../components/Header"
import { SearchTable } from "../components/SearchTable"
import { addProduct, loadProducts } from "../api/api_tools"
import { APIResponse, TNewProduct, TProduct } from "../types/types"
import { routes } from "../types/routes"
import { Alert, Button, FormLabel, Input, Stack } from "@mui/material"
import { useEffect, useState } from "react"
import * as Yup from 'yup'
import { useFormik } from "formik"
import { formatDateForInput } from "../api/tools"
import { getRandomProduct } from "../api/notes_generator"

export const Products = ({loadUnit}: {loadUnit: number}) => {

  const [isAddSelected, setAddSelected] = useState<boolean>(false)

  const productValidationSchema = Yup.object({
    name: Yup.string()
      .trim() 
      .required('Наименование продукта обязательно для ввода'),

    units_amount: Yup.number()
      .required('Количество единиц товара обязательно для ввода')
      .typeError('Должно быть число')
      .min(1, 'Количество единиц не может быть меньше 1'),

    unit_capacity: Yup.string()
      .required('Размер единицы товара обязателен для ввода'),

    bought_price: Yup.number()
      .typeError('Цена должна быть числом')
      .min(0, 'Цена не может быть отрицательной')
      .required('Закупочная цена обязательна для ввода'),

    bought_date: Yup.date()
      .typeError('Некорректная дата')
      .max(new Date(), 'Дата закупки не может быть в будущем')
      .required('Дата закупки обязательна для ввода'),

    expiration_date: Yup.date()
      .typeError('Некорректная дата')
      .min(Yup.ref('bought_date'), 'Срок годности не может быть раньше даты закупки')
      .required('Срок годности обязателен для ввода'),
  });

  const formik = useFormik({
      initialValues: {
        name: '',
        units_amount: '',
        unit_capacity: '',
        bought_price: '',
        bought_date: formatDateForInput(new Date()),
        expiration_date: ''
      },
      validationSchema: productValidationSchema,
      onSubmit: (input) => {
        setAddSelected(false);
        formik.resetForm();
        let product: TNewProduct = {
          name: input.name,
          unit_capacity: input.unit_capacity,
          units_amount: input.units_amount as any as number,
          bought_price: input.bought_price as any as number,
          bought_date: new Date(input.bought_date),
          expiration_date: new Date(input.expiration_date)
        };
        addProduct(product).then((response: APIResponse) => {
          if(response.status === 1){
            alert(response.error)
          }
        }).catch((err) => console.log(err))
      }
    }
  )

  return (
    <>
      <Header routes={routes}/>
      <Stack>
        <SearchTable<TProduct> placeholder='Поиск по закупкам' exceptions={[]} loadUnit={loadUnit} elementsLoader={(req: string | null, currentIndex: number, amount: number)=>loadProducts(req, currentIndex, amount)}/>
        <Button onClick={() => {setAddSelected(!isAddSelected); formik.resetForm()}} variant="contained">+</Button>
        <Stack style={{
          'opacity': isAddSelected ? 1 : 0,
          'transition': 'opacity 0.3s ease-in-out'
          }}>
          <form onSubmit={formik.handleSubmit}>
            <div>
              <FormLabel htmlFor="name">Наименование</FormLabel>
              <Input
                id="name"
                name="name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
              />
              {formik.touched.name && formik.errors.name ? (
                <Alert severity="error" style={{ color: 'red' }}>{formik.errors.name}</Alert>
              ) : null}
            </div>
            <div>
              <FormLabel htmlFor="units_amount">Количество единиц товара</FormLabel>
              <Input
                id="units_amount"
                name="units_amount"
                type="number"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.units_amount}
              />
              {formik.touched.units_amount && formik.errors.units_amount ? (
                <Alert severity="error" style={{ color: 'red' }}>{formik.errors.units_amount}</Alert>
              ) : null}
            </div>
            <div>
              <FormLabel htmlFor="unit_capacity">Размер единицы товара</FormLabel>
              <Input
                id="unit_capacity"
                name="unit_capacity"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.unit_capacity}
              />
              {formik.touched.unit_capacity && formik.errors.unit_capacity ? (
                <Alert severity="error" style={{ color: 'red' }}>{formik.errors.unit_capacity}</Alert>
              ) : null}
            </div>
            <div>
              <FormLabel htmlFor="bought_date">Дата закупки</FormLabel>
              <Input
                id="bought_date"
                name="bought_date"
                type="date"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.bought_date}
              />
              {formik.touched.bought_date && formik.errors.bought_date ? (
                <Alert severity="error" style={{ color: 'red' }}>{formik.errors.bought_date}</Alert>
              ) : null}
            </div>
            <div>
              <FormLabel htmlFor="bought_price">Закупочная стоимость</FormLabel>
              <Input
                id="bought_price"
                name="bought_price"
                type="number"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.bought_price}
              />
              {formik.touched.bought_price && formik.errors.bought_price ? (
                <Alert severity="error" style={{ color: 'red' }}>{formik.errors.bought_price}</Alert>
              ) : null}
            </div>
            <div>
              <FormLabel htmlFor="expiration_date">Срок годности</FormLabel>
              <Input
                id="expiration_date"
                name="expiration_date"
                type="date"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.expiration_date}
              />
              {formik.touched.expiration_date && formik.errors.expiration_date ? (
                <Alert severity="error" style={{ color: 'red' }}>{formik.errors.expiration_date}</Alert>
              ) : null}
            </div>
            <Button type='submit' disabled={formik.isSubmitting} variant="contained">Подтвердить</Button>
          </form>
        </Stack>
      </Stack>
    </>
 )
}