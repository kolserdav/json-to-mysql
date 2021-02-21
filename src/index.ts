import { prisma } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
import Module from './Module';
import Console from './lib/Console'; 
import * as T from './types';

const module = new Module();

/**
 * Регулярное выражение названия архива прайсов
 */
const priceRegex = /^\d+\.\d+\.\d+\-\d+ ?:?\d+\-price.tar.gz$/ 

// Парсит папку с данными
const dir = module.parseDataDir();
(async () => {
  // Проходит по элементам папки
  for (let i = 0; dir[i]; i++) {
    const fileName = dir[i];
    // Если это прайс
    if (priceRegex.test(fileName)) {
      // Извлекает архив и получает данные по прайсам
      await module.extractArchive(fileName, 'price');
      const fileData = await module.getFileData<T.SourcePrices>('price');
      Console.info(`Write in table "Price" from archive "${fileName}"...`);
      // Записывает каждый прайс
      for (let prop in fileData) {
        const price = fileData[prop];
        await module.saveOnePrice(price, fileName);
      }
      Console.info(`Prices from archive "${fileName}" write successfully!`);
      // Получает имя архива продавцов из имени архива прайсов
      const sellersFilename = fileName.replace('price', 'sellers');
      // Делает то же что и по прайсам, то есть пишет в базу но в свою таблицу
      await module.extractArchive(sellersFilename, 'sellers');
      const fileSellersData = await module.getFileData<T.SourceSeller[]>('sellers');
      Console.info(`Write in table "Sellers" from archive "${sellersFilename}"...`);
      for (let i = 0; fileSellersData[i]; i++) {
        const seller = fileSellersData[i];
        await module.saveOneSeller(seller, fileName);
      }
    }
  }
  await module.disconnect();
})();