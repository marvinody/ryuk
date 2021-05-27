// Check out the readme if need explanation on this folder/file...
require('dotenv').config();

import {getExtractor} from '../extractors';
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
      'https://www.pokemoncenter.com/product/290-80545/pokemon-tcg-champion-s-path-elite-trainer-box',
    sku: '290-80545',
    status: 'NOT_AVAILABLE',
  },
];
(async () => {
  let hasErrored = false;

  for (const {url, sku, status} of cases) {
    try {
      const extractor = getExtractor(url);
      const result = await extractor.extract(url);
      console.log(result);

      if (result.id !== sku) {
        throw new Error(
          `SKU mismatch: Expected "${result.id}" to equal "${sku}" for ${url}`
        );
      }
      if (result.status !== status) {
        throw new Error(
          `Status mismatch: Expected "${result.status}" to be "${status}" for ${url}`
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
