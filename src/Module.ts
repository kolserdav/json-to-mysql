import fs from 'fs';
import path from 'path';
import tar from 'tar-stream';
import zlib from 'zlib';
import { PrismaClient, Seller, Price } from '@prisma/client';
import Console from './lib/Console'; 
import * as T from './types';

interface Env {
  DATABASE_URL: string;
  DATA_DIR: string;
}

const { env }: any = process;
const { DATA_DIR }: Env = env;

type FilePrefix = 'price' | 'sellers';

class Module {
  // Клиент prisma
  prisma: PrismaClient;

  // При создании экземляра происходит подключение к базе данных
  public constructor() {
    this.prisma = new PrismaClient();
  }

  public connect() {
    this.prisma = new PrismaClient();
  }

  /**
   * Парсит папку с файлами данных
   */
  public parseDataDir() {
    Console.info(`Parsing directory "${DATA_DIR}"...`);
    return fs.readdirSync(DATA_DIR);
  }

  /**
   * Извекает файл из архива
   * и записывает во временный файл 
   * @param fileName {string} имя файла архива 
   * @param prefix {FilePrefix} префикс события ['price' | 'sellers'] 
   */
  public async extractArchive(fileName: string, prefix: FilePrefix) {
    const filePath = path.resolve(DATA_DIR, fileName);
    Console.info(`Extrat archive "${filePath}"...`);
    let data = '';
    await new Promise ((resolve) => {
      const extract = tar.extract();
      // Извлечение файла из архива
      extract.on('entry', (header, stream, cb) => {
        // Запись чанков в data
        stream.on('data', (chunk) => {
          if (header.name == `root/hotline/${prefix}.json`)
              data += chunk;
        });
        // Когда данные записаны вызывает каллбак в onfinish
        stream.on('end', () => {
            cb();
        });
        stream.resume();
      });
      // Cрабатывает когда извлеченныe данные записаны в data и сработал onend
      // и выходит из промиса
      extract.on('finish', () => {
        fs.writeFileSync(path.resolve(__dirname, `../tmp/${prefix}.json`), data);
        resolve(0);
      });
      // Создает поток чтения и направляет его сначала в создание zip
      // потом экстрактору
      fs.createReadStream(filePath)
        .pipe(zlib.createGunzip())
        .pipe(extract);
    });
  }

  /**
   * Возвращает данные извлеченного файла в зависимости от префикса
   * @param prefix {FilePrefix} префикс события ['price' | 'sellers'] 
   */
  public getFileData<U>(prefix: FilePrefix): U {
    const tmpFilePath = path.resolve(__dirname, `../tmp/${prefix}.json`);
    Console.info(`Read temporary file "${tmpFilePath}"...`);
    const data = fs.readFileSync(tmpFilePath);
    return JSON.parse(data.toString());
  }

  /**
   * Пишет один прайс в базу
   * @param price {SourcePrice} один прайс элемент
   * @param fileName {string} имя исходного файла
   */
  public saveOnePrice(
    price: T.SourcePrice,
    fileName: string
  ): Promise<number> {
    return new Promise((resolve) => {
      const EMPTY = 'empty';
      const EMPTY_NUM = -1;
      // Проверяет не была ли запись сохранена ранее
      const ID = parseInt(price.ID, 10);
      const isSaved = this.checkPriceByFileName(ID, fileName);
      isSaved.then((data) => {
        if (data === null) {
          //console.log(price)
          // Проверяет не пустые ли даты
          let datePublic: Date | null = new Date(price['Дата публикации'] || '');
          datePublic = isNaN(datePublic.getTime()) ? null : datePublic;
          let dateComtrading: Date | null = new Date(price.date_comtrading);
          dateComtrading = isNaN(dateComtrading.getTime()) ? null : dateComtrading;
          // Пишет в базу
          const saveRes = this.prisma.price.create({
            data: {
              aggregator:price.Аггрегатор || EMPTY,
              price_id: ID,
              product_name: price['Название товара'] || EMPTY,
              category_name: price['Название категории'] || EMPTY,
              price_supplier: price['Цена поставщика'] || EMPTY_NUM,
              price_min: price['Минимальная цена'] || EMPTY_NUM,
              price_adapted: price['Адаптированная цена'] || EMPTY_NUM,
              margin_before: price['Маржа до, грн'] || EMPTY_NUM,
              margin_after: price['Сумма маржа после'] || EMPTY_NUM,
              date_public: datePublic,
              price_publisher: price['Публикатор цены'] || EMPTY,
              price_column: price['Column1.price'],
              hotline_url: price.hotline_url,
              data_parse: new Date(price.date_parse),
              data_parse_human: new Date(price.date_parse_human),
              date_comtrading: dateComtrading,
              source_file: fileName,
            }
          });
          saveRes.then(() => {
            resolve(0);
          });
        } else {
          resolve(1);
        }
      });
    });
  }

  /**
   * Записывает одного продавца в базу
   * @param seller {SourceSeller} объект одного продавца
   * @param fileName {string} имя файла архива соответствующего прайса
   */
  public saveOneSeller(seller: T.SourceSeller): Promise<number> {
    return new Promise((resolve) => {
      // Проверяет не сохранено ли раньше и записывает в базу
      const isSaved = this.checkSellerByDate(seller.price, seller.dt);
      let newDate = new Date(seller.dt);
      newDate = isNaN(newDate.getDay()) ? new Date() : newDate;
      isSaved.then((data) => {
        if (data === null) {
          const saveRes = this.prisma.seller.create({
            data: {
              prod_id: parseInt(seller.prod_id, 10),
              aggregator_id: parseInt(seller.aggregator_id, 10),
              dt: newDate,
              seller: seller.seller,
              price: seller.price,
              delivery_free: seller.delivery_free,
              delivery_kiev: seller.delivery_kiev,
            }
          });
          saveRes.then(() => {
            resolve(0);
          });
        } else {
          resolve(1);
        }
      });
    });
  }

  /**
   * Проверяет не был ли сохранен ранее под указанным ID
   * из указанного исходного файла архива
   * @param id {number} ID прайса
   * @param fileName {string} название исходного файла архива
   */
  private checkPriceByFileName(
    id: number,
    fileName: string
  ): Promise<Price | null> {
    return new Promise((resolve) => {
      const data =  this.prisma.price.findFirst({
        where: {
          price_id: id,
          source_file: fileName,
        }
      });
      resolve(data);
    });
  } 

  /**
   * 
   * @param priceId {number} ид прайса
   * @param date {string} дата прайса
   */
  private checkSellerByDate(priceId: number, date: string): Promise<Seller | null> {
    return new Promise((resolve) => {
      let newDate = new Date(date);
      newDate = isNaN(newDate.getDay()) ? new Date() : newDate;
      const data = this.prisma.seller.findFirst({
        where: {
          prod_id: priceId,
          dt: newDate,
        },
      });
      resolve(data);
    });
  }

  /**
   * Отключение от базы данных
   */
  disconnect() {
    this.prisma.$disconnect();
  }
}

export default Module;