import { TNewProduct } from "../types/types";

function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("Массив пуст");
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function getRandomDatePair(): [Date, Date] {
  const minStart = new Date('2026-02-10T00:00:00').getTime();
  
  const maxEnd = new Date('2027-02-08T23:59:59').getTime();

  const randomStartTime = Math.floor(Math.random() * (maxEnd - minStart + 1)) + minStart;
  
  const minEndTime = randomStartTime + 1000 * 60 * 60 * 24;

  if (minEndTime >= maxEnd) {
    return getRandomDatePair();
  }

  const randomEndTime = Math.floor(Math.random() * (maxEnd - minEndTime + 1)) + minEndTime;

  return [new Date(randomStartTime), new Date(randomEndTime)];
}

export function getRandomProduct() {
  const isLiquid = Math.random() > 0.5;
  const unit = isLiquid ? "мл" : "г";
  const size = Math.floor((Math.random() + 0.1) * 1000); 
  const list = isLiquid ? liquidProducts : solidProducts;
  const shortname = getRandomElement(list);
  const brand = getRandomElement(brands);
  const name = `${shortname} "${brand}"`
  const unit_capacity = `${size} ${unit}`
  const units_amount = Math.floor((Math.random() + 0.1) * 30); 
  const bought_price = Math.floor((Math.random() + 0.1) * 1000); 
  const [bought_date, expiration_date] = getRandomDatePair()
  
  const product: TNewProduct = {name, unit_capacity, units_amount, bought_price, bought_date, expiration_date};
  return product
}

const liquidProducts = [
  "Вода", "Молоко", "Кола", "Кефир", "Сок", "Лимонад", "Нектар", "Ряженка", 
  "Бульон", "Соус", "Подливка", "Заправка", "Маринад", "Уксус", "Масло",
  "Йогурт", "Сметана"
];

const solidProducts = [
  "Печенье", "Чипсы", "Сухари", "Шоколад", "Хлеб", "Сыр", "Майонез", "Кофе", "Чай",
  "Батон", "Лапша", "Кетчуп", "Горчица", "Халва", "Вафли", "Зефир", "Мармелад", "Карамель", "Ирис",
  "Пряник", "Кекс", "Бублик", "Сушка", "Крендель", "Попкорн", "Фисташки", "Арахис", "Миндаль", "Фундук",
  "Изюм", "Курага", "Чернослив", "Яблоко", "Банан", "Апельсин", "Мандарин", "Груша", "Вишня", "Слива",
  "Персик", "Абрикос", "Лимон", "Лайм", "Грейпфрут", "Арбуз", "Дыня", "Клубника", "Малина", "Смородина",
  "Черника", "Ежевика", "Крыжовник", "Облепиха", "Рябина", "Калина", "Шиповник", "Барбарис", "Финик", "Инжир",
  "Гранат", "Хурма", "Авокадо", "Киви", "Ананас", "Манго", "Папайя", "Гуава", "Кокос", "Оливки",
  "Маслины", "Каперсы", "Грибы", "Огурец", "Помидор", "Перец", "Баклажан", "Кабачок", "Тыква", "Кукуруза", 
  "Рис", "Гречка", "Пшено", "Перловка", "Манка", "Овес", "Ячка", "Булгур", "Киноа", "Амарант",
  "Макароны", "Спагетти", "Вермишель", "Равиоли", "Пельмени", "Вареники", "Хинкали", "Драники", "Блины",
  "Сосиски", "Колбаса", "Ветчина", "Бекон", "Карбонад", "Грудинка", "Сало", "Тушенка", "Паштет", "Тефтели",
  "Курица", "Индейка", "Утка", "Гусь", "Кролик", "Телятина", "Свинина", "Говядина", "Баранина", "Конина",
  "Окунь", "Судак", "Щука", "Карась", "Лещ", "Семга", "Форель", "Тунец", "Скумбрия", "Сельдь",
  "Креветки", "Крабы", "Мидии", "Кальмары", "Осьминог", "Икра", "Молоки", "Филе", "Стейк", "Котлеты",
  "Приправа", "Специя", "Соль", "Сахар", "Сырник", "Запеканка", "Пудинг", "Мусс", "Желе", 
  "Суфле", "Крем", "Глазурь", "Посыпка", "Творог"
];

const brands = ["Вектор", "Родник", "Зенит", "Орион", "Старт", "Факел", "Прима", "Эталон", 
    "Квант", "Спектр", "Импульс", "Фортуна", "Гарант", "Лидер", "Атлант", "Вершина", 
    "Омега", "Нектар", "Дар", "Бриз", "Луч", "Мир", "Тонус", "Вита", "Смак", "Гранд", "Нова", 
    "Альфа", "Классик", "Премиум", "Выбор", "Удача", "Традиция", "Акцент", "Ритм", "Пульс", 
    "Формат", "Стиль", "Вкус", "Дом"];
