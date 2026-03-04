import { Header } from "../components/Header"
import { SearchTable } from "../components/SearchTable"
import { addProduct, changeProduct, deleteProduct, loadProducts } from "../api/api_tools"
import { APIResponse, TNewProduct, TProduct } from "../types/types"
import { routes } from "../types/routes"
import { Alert, Button, Dialog, FormLabel, Input, Stack } from "@mui/material"
import { useState } from "react"
import * as Yup from 'yup'
import { useFormik } from "formik"
import { formatDateForInput } from "../api/tools"
import { differenceInDays, addDays } from 'date-fns';

export const Products = ({loadUnit}: {loadUnit: number}) => {

  const [isAddSelected, setAddSelected] = useState<boolean>(false)
  const [tableReload, setTableReload] = useState<number>(1)
  const [isSubmitNecessary, setIsSubmitNecessary] = useState<boolean>(false)
  const [currentElement, setCurrentElement] = useState<TProduct>()
  const [isChange, setIsChange] = useState<boolean>(false)

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
        units_bought_amount: '',
        bought_price: '',
        bought_date: formatDateForInput(new Date()),
        expiration_date: ''
      },
      validationSchema: productValidationSchema,
      onSubmit: (input) => {
        setAddSelected(false);
        setTableReload(tableReload*(-1))
        formik.resetForm();
        let product: TNewProduct = {
          name: input.name,
          unit_capacity: input.unit_capacity,
          units_bought_amount: parseInt(input.units_amount, 10),
          units_amount: parseInt(input.units_amount, 10),
          bought_price: parseInt(input.bought_price, 10),
          bought_date: new Date(new Date(input.bought_date).setHours(0, 0, 0, 0)),
          expiration_date: new Date(new Date(input.expiration_date).setHours(0, 0, 0, 0))
        };
        if (!isChange){
          addProduct(product).then((response: APIResponse) => {
            if(response.status === 1){
              alert(response.error)
            }
          }).catch((err) => console.log(err))
        }
        else{
          changeProduct({...product, id: currentElement?.id} as TProduct).then((response: APIResponse) => {
            if(response.status === 1){
              alert(response.error)
              return
            }
            setIsChange(false)
            setTableReload(tableReload*(-1))
            console.log(product);
          }).catch((err) => console.log(err))
        }
      }
    }
  )

  return (
    <>
      <Header routes={routes}/>
      <Stack>
        <SearchTable<TProduct> 
          placeholder='Поиск по закупкам' 
          exceptions={[]} 
          columnOrder={['name', 'unit_bought_price', 'units_amount', 'units_bought_amount', 'bought_price', 'bought_date', 'expiration_date']}
          loadUnit={loadUnit} 
          key={tableReload}
          elementsLoader={
            (req: string | null, currentIndex: number, amount: number)=>loadProducts(req, currentIndex, amount)
            }
          onRepeat={(el) => {
            const diff = (differenceInDays(el.expiration_date, el.bought_date));
            const newExpirationDate = addDays(new Date(), diff)
            setAddSelected(true); 
            formik.setFieldValue('name', el.name); 
            formik.setFieldValue('unit_capacity', el.unit_capacity);
            formik.setFieldValue('bought_price', el.bought_price);
            formik.setFieldValue('expiration_date', formatDateForInput(newExpirationDate))
          }}
          onChange={(el) => {
            setAddSelected(true);
            setCurrentElement(el)
            formik.setFieldValue('name', el.name); 
            formik.setFieldValue('unit_capacity', el.unit_capacity);
            formik.setFieldValue('bought_price', el.bought_price);
            formik.setFieldValue('expiration_date', formatDateForInput(el.expiration_date));
            formik.setFieldValue('units_amount', el.units_bought_amount);
            formik.setFieldValue('units_bought_amount', el.units_bought_amount);
            formik.setFieldValue('bought_date', formatDateForInput(el.bought_date));
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
            <form id="add-product" onSubmit={formik.handleSubmit} style={{minWidth: 500, minHeight: 400, padding: '5px'}}>
              <Stack direction={'column'} justifyContent={'space-between'} style={{height: '100%'}}>
                <Stack direction={'column'}>
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
                </Stack>
                <Stack direction={'column'}>
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
                </Stack>
                <Stack direction={'column'}>
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
                </Stack>
                <Stack direction={'column'}>
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
                </Stack>
                <Stack direction={'column'}>
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
                </Stack>
                <Stack direction={'column'}>
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
            <Button style={{marginBottom: '5px'}} variant="contained" onClick={() => {if (currentElement) {deleteProduct(currentElement); setTableReload(tableReload*(-1)); setIsSubmitNecessary(false)}}}>Подтвердить</Button>
            <Button variant="contained" onClick={() => setIsSubmitNecessary(false)}>Отмена</Button>
            </Stack>
          </Dialog>
        </Stack>
      </Stack>
    </>
 )
}