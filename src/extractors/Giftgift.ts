import logger from '../util/logger';
import {waitBetweenCalls} from '../util/minWait';
import {DiscordEmbed} from '../util/discord';
import {Extractor, Item} from './IExtractor';
import axios from 'axios';
import {promises} from 'fs';
import {parse, HTMLElement} from 'node-html-parser';

const DELAY_BETWEEN_LOOKUPS_IN_MS = 2000;

type GiftItem = Item & {
  imageUrl: string;
};

const _TestUrls: string[] = [
  'http://giftshop.jz.shopserve.jp/SHOP/n739_2.html',
];

const regexes = {
  URL: 'https?://giftshop.jz.shopserve.jp/SHOP/(?<productCode>.*).html',
  NO_STOCK: 'src="/hpgen/HPB/theme/img/btn_nostock.gif"',
  IN_STOCK: 'src="/hpgen/HPB/theme/img/btn_cart.gif"',
};

const selectors = {
  TITLE: 'h2.red.no2',
  IMAGE: 'img.mainImg',
};

const store = 'Giftshop';
const urlRegexp = new RegExp(regexes.URL);

const isGiftItem = (item: Item): item is GiftItem => {
  return item.store === store;
};

const getStockStatus = (html: string) => {
  if (new RegExp(regexes.NO_STOCK).test(html)) {
    return 'Out of stock';
  }
  if (new RegExp(regexes.IN_STOCK).test(html)) {
    return 'In stock';
  }
  return 'Unknown status';
};

const getTitle = (root: HTMLElement): string => {
  const title = root.querySelector(selectors.TITLE);
  return title.text;
};

const getImageUrl = (root: HTMLElement): string => {
  const image = root.querySelector(selectors.IMAGE);
  const src = image.getAttribute('src');

  if (src === undefined) {
    return 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fa%2Fac%2FNo_image_available.svg%2F1024px-No_image_available.svg.png&f=1&nofb=1';
  }

  if (src.startsWith('//')) {
    return `http:${src}`;
  }
  return src;
};

const makeEmbed = (liveItem: Item, oldItem?: Item): DiscordEmbed | null => {
  if (!isGiftItem(liveItem)) {
    throw new Error(`Item: ${liveItem.id}@${liveItem.store} is not a GiftItem`);
  }

  const embed: DiscordEmbed = {
    url: liveItem.url,
    title: `[${liveItem.id}] - ${liveItem.title}`,
    description: `Initial Stock Update: "${liveItem.status}"`,
    image: {
      url: liveItem.imageUrl,
    },
  };

  if (!oldItem) {
    // fresh item
    return embed;
  } else {
    if (liveItem.status !== oldItem.status) {
      embed.description = `Stock Update: "${oldItem.status}" -> "${liveItem.status}"`;
    }
  }
  return null;
};

export const GiftgiftExtractor: Extractor = {
  _TestUrls,
  isValidUrl: (url: string) => urlRegexp.test(url),
  makeEmbed: makeEmbed,
  extract: waitBetweenCalls(DELAY_BETWEEN_LOOKUPS_IN_MS)(
    async (url: string): Promise<GiftItem> => {
      logger.info(`${url}: Searching`);
      const regexpResult = url.match(urlRegexp);
      if (!regexpResult?.groups) {
        const err = new Error(`Could not detect any regexp groups from ${url}`);
        logger.error(err);
        throw err;
      }

      const {productCode} = regexpResult.groups;

      const {data: html} = await axios.get(url);

      const status = getStockStatus(html);

      const root = parse(html);

      return {
        id: productCode,
        title: getTitle(root),
        status,
        url,
        store,
        imageUrl: getImageUrl(root),
      };
    }
  ),
};
