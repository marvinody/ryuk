import XRay from 'x-ray';
import {get} from '../util/http';
import logger from '../util/logger';
import {waitBetweenCalls} from '../util/minWait';
import {Extractor, Item, genericDiscordMessage} from './IExtractor';

const DELAY_BETWEEN_LOOKUPS_IN_MS = 5000;

const x = XRay();

const options = {
  followRedirects: true,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (X11; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    TE: 'Trailers',
    Cookie:
      'UID=47bebf67-c772-4624-8f0e-bda45291b838; pst2=478|N; physical_dma=501; customerZipCode=11377|N; oid=1773878008; vt=cf38a210-5184-11eb-83dd-12e56de9e2ab; _abck=5D35BD88BD3E4F258E4EDA66C9497F27~-1~YAAQNJUzuARwCJ12AQAAH7zw4AV/YEGreArubYLddaXbmCDGm3L03S2KldWuog8H4TxilxrTags9EkPlVPyytduo56cORVtUYj6CS+iwtecR6NmJH9BE1jTbYk4BxdEAN9vElBBouCkxW5zddQMeH0+8ai9w2ZZ6P+5XVcqs2FQ13LmQavd5YkXA33eDnTYwLtqJaKSZvxU/ke1dfHAU+W2opXGXpNYPo6SR0Z8YbxNj+ctz7uRtOmN9CRFJRaFWdFE6Dr9cncrUwmb6YyG99B5rv9YtyEu/V+kGxx5Ywv75RPQ74MB+gSZXfw==~-1~-1~-1; bm_sz=A274554B2CCE0C567ED11ED249675B89~YAAQNJUzuANwCJ12AQAAH7zw4ApJc4DowmOzZ3mWS2b2qSpl9RnvT/tSlN59feV6ggCZUjgCXXkExCBfRsDnNMgS9NC0dujkkarbmnPVnNtpw6EvOFCG34xB7m8mVYljpMqByI/vrHmEOLusktwv1NzGjJMm2nSTvbWtCnKcG4SchEkq+7HqaA14gJW975yLog==; bby_rdp=l; CTT=6ee4138fb450441cfafbffc5b13a0241; SID=5b2ce497-14ec-447e-b918-7b00fffe8416',
  },
};

type DriverCallback = (err: Error | null, data?: Object) => void;

const makeDriver = ({
  headers,
  followRedirects,
}: {
  headers: object;
  followRedirects: boolean;
}) => {
  return async (ctx: {url: string; body: object}, cb: DriverCallback) => {
    logger.debug(`Going to ${ctx.url}`);

    get(ctx.url, {
      headers,
      followRedirects,
    })
      .then(({data}) => {
        ctx.body = data;
        cb(null, data);
      })
      .catch(err => {
        cb(err, {});
      });
  };
};

const driver = makeDriver(options);

x.driver(driver);

const ADD_TO_CART_SELECTOR = '.fulfillment-add-to-cart-button button';

type BestBuyItem = Item & {};

const _TestUrls: string[] = [];
const store = 'Bestbuy';
const urlRegexp = /https?:\/\/www.bestbuy.com\/site\/(?<title>.*)\/(?<sku>.*)\.p/;

export const BestBuyExtractor: Extractor = {
  _TestUrls,
  isValidUrl: (url: string) => urlRegexp.test(url),
  makeEmbed: genericDiscordMessage,
  extract: waitBetweenCalls(DELAY_BETWEEN_LOOKUPS_IN_MS)(
    (url: string): Promise<BestBuyItem> => {
      logger.info(`${url}: Searching`);
      const regexpResult = url.match(urlRegexp);
      if (!regexpResult?.groups) {
        const err = new Error(`Could not detect any regexp groups from ${url}`);
        logger.error(err);
        throw err;
      }

      const {sku, title} = regexpResult.groups;

      // have to wrap in promise because xray isn't a promise...it's promise-like... with just a .then
      return new Promise(res => {
        x(url, 'body', ADD_TO_CART_SELECTOR).then((value: string) => {
          logger.info(`${sku}: status=${value}`);
          res({
            id: sku,
            title,
            status: value,
            url,
            store,
          });
        });
      });
    }
  ),
};
