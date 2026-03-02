import { ElementsComparation, FieldSortParams } from "../types/types";

export const formatDateForInput = (date: Date | null) => {
  if (!date) return '';
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

function descendingComparator<T>({a, b, orderBy}: ElementsComparation<T>) {
  if (orderBy != 'unit_capacity'){
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  else{
    let value_a: number = parseInt((a[orderBy] as string).split(' ')[0], 10)
    let value_b: number = parseInt((b[orderBy] as string).split(' ')[0], 10)

    if (value_b < value_a) {
      return -1;
    }
    if (value_b > value_a) {
      return 1;
    }
    return 0;
  }
}

export function getComparator<T>({order, orderBy}: FieldSortParams<T>){
  return order === 'desc'
    ? (a: T, b: T) => descendingComparator({a, b, orderBy})
    : (a: T, b: T) => -descendingComparator({a, b, orderBy});
}