// Check out the readme if need explanation on this folder/file...
require('dotenv').config();

import {constructExtractorMappings} from '../extractors';
import {makeWebhook} from '../util/discord';

const webhook = makeWebhook(process.env.WEBHOOK_URL, process.env.USERNAME);

const cases = [
  {
    url:
      'https://www.bestbuy.com/site/sony-playstation-5-console/6426149.p?skuId=6426149',
    sku: '6426149',
    status: 'Sold Out',
  },
  {
    url:
      'https://www.pokemoncenter.com/product/173-80700/pokemon-tcg-charizard-ex-box',
    sku: '173-80700',
    status: 'OUT_OF_STOCK',
  },
];
(async () => {
  const urls = cases.map(c => c.url);

  const lookups = constructExtractorMappings(urls);

  let hasErrored = false;

  for (const {url, sku, status} of cases) {
    try {
      const result = await lookups(url);
      console.log(result);

      if (result.id !== sku) {
        throw new Error(
          `SKU mismatch: Expected "${result.id}" to equal "${sku}"`
        );
      }
      if (result.status !== status) {
        throw new Error(
          `Status mismatch: Expected "${result.status}" to be "${status}"`
        );
      }
    } catch (err) {
      console.error(err);
      hasErrored = true;
      await webhook(err.message);
    }
  }
  if (!hasErrored) {
    await webhook('SNAFU');
  }
})();
