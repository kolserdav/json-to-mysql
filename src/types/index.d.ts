export interface SourcePrice {
  'Аггрегатор': string;
  'Код производителя': string;
  ID: string;
  'Название товара': string;
  'Название категории': string;
  'Цена поставщика': number;
  'Минимальная цена': number;
  'Адаптированная цена': number;
  'Маржа до, грн': number;
  'Сумма маржа после': number;
  'Дата публикации': string;
  'Публикатор цены': string;
  'Column1.price': null;
  hotline_url: string;
  date_parse: number;
  date_parse_human: string;
  date_comtrading: string;
}

export interface SourceSeller {
  prod_id: string;
  aggregator_id: string;
  dt: string;
  seller: string;
  price: number
  delivery_kiev: boolean;
  delivery_free: boolean;
}

export interface SourcePrices {
  [prop: string]: SourcePrice;
}