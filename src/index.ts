import { prisma } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
import Module from './Module';
import Console from './lib/Console'; 
import * as T from './types';

const module = new Module();

const priceRegex = /^\d+\.\d+\.\d+\-\d+ ?:?\d+\-price.tar.gz$/ 

const dir = module.parseDataDir();
(async () => {
  for (let i = 0; dir[i]; i++) {
    const fileName = dir[i];
    if (priceRegex.test(fileName)) {
      await module.extractArchive(fileName, 'price');
      const fileData = await module.getFileData<T.SourcePrices>('price');
      Console.info(`Write in table "Price" from archive "${fileName}"...`);
      for (let prop in fileData) {
        const price = fileData[prop];
        //await module.saveOnePrice(price, fileName);
      }
      Console.info(`Prices from archive "${fileName}" write successfully!`);
      await module.extractArchive(fileName.replace('price', 'sellers'), 'sellers');
      const fileSellersData = await module.getFileData<T.SourceSeller[]>('sellers');
      for (let i = 0; fileSellersData[i]; i++) {
        const seller = fileSellersData[i];
        await module.saveOneSeller(seller, fileName);
      }
      await module.disconnect();
      break;
    }
  }
})();