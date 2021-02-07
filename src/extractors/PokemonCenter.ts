import {Extractor, Item} from './IExtractor';
import {waitBetweenCalls} from '../util/minWait';
import logger from '../util/logger';
import {get as getValue} from 'lodash';
import fetch from 'node-fetch';

const DELAY_BETWEEN_LOOKUPS_IN_MS = 5000;

const _TestUrls: string[] = [];
const store = 'Pokemon Center';
const urlRegexp = /https?:\/\/www.pokemoncenter.com\/product\/(?<sku>.*)\/(?<title>.*)/;

type PokemonCenterItem = Item & {};

export const PokemonCenterExtractor: Extractor = {
  _TestUrls,
  isValidUrl: (url: string) => urlRegexp.test(url),
  extract: waitBetweenCalls(DELAY_BETWEEN_LOOKUPS_IN_MS)(
    (url: string): Promise<PokemonCenterItem> => {
      logger.info(`${url}: Searching`);
      const regexpResult = url.match(urlRegexp);
      if (!regexpResult?.groups) {
        const err = new Error(`Could not detect any regexp groups from ${url}`);
        logger.error(err);
        throw err;
      }

      const {sku, title} = regexpResult.groups;
      return fetch(
        `https://www.pokemoncenter.com/tpci-ecommweb-api/product/${sku}?format=zoom.nodatalinks`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0',
            Accept: '*/*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Content-Type': 'application/json',
            'X-Store-Scope': 'pokemon',
            'Sec-GPC': '1',
            Pragma: 'no-cache',
            'Cache-Control': 'no-cache',
            Referer: 'https://www.pokemoncenter.com/category/elite-trainer-box',
          },
          method: 'GET',
        }
      ).then(async resp => {
        const data = await resp.json();
        const status = getValue(
          data,
          '_items[0]._element[0]._availability[0].state'
        );
        return {
          id: sku,
          status: status,
          store,
          title,
          url,
        };
      });
    }
  ),
};
