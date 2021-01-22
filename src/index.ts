require('dotenv').config();

const path = require('path');

const db = require('./db');
const bestbuy = require('./bestbuy');
const logger = require('./logger');
const jsonc = require('./jsonc');
const discord = require('./discord');

const BESTBUY_SKU_FILE = path.join(__dirname, '..', 'bestbuy-skus.jsonc');

const bestbuySkus = jsonc(BESTBUY_SKU_FILE);

(async () => {
  for (const sku of bestbuySkus) {
    // hit bestbuy website to check status
    const liveItem = await bestbuy({ sku });

    // hit local DB to see if need to create or seen it
    const dbKey = `bestbuy-${sku}`;
    const [newlyCreated, currentItem] = db.findOrCreate(dbKey, liveItem);

    if (newlyCreated) {
      logger.info(`${sku} first lookup: sending`);
      const message = `First update: ${sku}-${liveItem.status}\n${liveItem.url}`;
      await discord.webhook(message);
    } else {
      // have a record of it, let's see if it's been updated
      if (liveItem.status !== currentItem.status) {
        const partialMessage = `${sku} updated: ${currentItem.status} -> ${liveItem.status}`;
        logger.info(partialMessage);
        await discord.webhook(`${partialMessage}\n${liveItem.url}`);
        db.updateById(dbKey, liveItem);
      }
    }
  }
  await db.flush();
})();
