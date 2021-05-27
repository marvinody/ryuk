import logger from '../util/logger';
import {makeWebhook} from '../util/discord';
import {getExtractor} from '../extractors';

const webhook = makeWebhook(process.env.WEBHOOK_URL, process.env.USERNAME);

const randomNumber = (min: number, max: number) => {
  const range = max - min;

  return range * Math.random() + min;
};

const MIN_DELAY = 5 * 1000;
const MAX_DELAY = 1 * 30 * 1000;

interface DB {
  findOrCreate: <T>(id: string, defaults: T) => [boolean, T];
  updateById: (id: string, newProps: Object) => Object;
}

const searchAndUpdate = async (url: string, db: DB) => {
  try {
    const extractor = getExtractor(url);
    const liveItem = await extractor.extract(url);

    const [newlyCreated, currentItem] = db.findOrCreate(url, liveItem);
    const message = extractor.makeEmbed(
      liveItem,
      newlyCreated ? undefined : currentItem
    );

    if (newlyCreated) {
      logger.info(`${liveItem.id} first lookup`);
    } else {
      // check for our internal logs
      if (liveItem.status !== currentItem.status) {
        const partialMessage = `${currentItem.title} updated: ${currentItem.status} -> ${liveItem.status}`;
        logger.info(partialMessage);
        db.updateById(url, liveItem);
      }
    }

    if (message !== null) {
      await webhook(message, liveItem.store);
    }
  } catch (err) {
    logger.error(err);
  }
  // queue up again for some time later...
  setTimeout(searchAndUpdate, randomNumber(MIN_DELAY, MAX_DELAY), url, db);
};

export default (urls: string[], db: DB) => {
  for (const url of urls) {
    searchAndUpdate(url, db);
  }
};
