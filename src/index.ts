import { prisma } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
import Module from './Module';
import Console from './lib/Console'; 
import * as T from './types';

let module = new Module();

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
      let pricePromises = [];
      for (let prop in fileData) {
        const price = fileData[prop];
        pricePromises.push(module.saveOnePrice(price, fileName));
      }
      await Promise.all(pricePromises);
      pricePromises = [];
      Console.info(`Prices from archive "${fileName}" write successfully!`);
      // Получает имя архива продавцов из имени архива прайсов
      const sellersFilename = fileName.replace('price', 'sellers');
      // Делает то же что и по прайсам, то есть пишет в базу но в свою таблицу
      await module.extractArchive(sellersFilename, 'sellers');
      const fileSellersData = await module.getFileData<T.SourceSeller[]>('sellers');
      Console.info(`Write in table "Sellers" from archive "${sellersFilename}"...`);
      let sellerPromises = [];
      for (let i = 0; fileSellersData[i]; i++) {
        const seller = fileSellersData[i];
        sellerPromises.push(module.saveOneSeller(seller));
        if (i%10000 === 0) {
          await Promise.all(sellerPromises);
          sellerPromises = [];
        }
      }
      await Promise.all(sellerPromises);
      sellerPromises = [];
      Console.info(`Sellers from archive "${sellersFilename}" write successfully!`);
    }
  }
  await module.disconnect();
  Console.info('All files are transferred!');
})();