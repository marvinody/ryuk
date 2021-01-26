import logger from '../util/logger';
import {makeWebhook} from '../util/discord';
import {constructExtractorMappings, Item} from '../extractors';

const webhook = makeWebhook(process.env.WEBHOOK_URL, process.env.USERNAME);

const randomNumber = (min: number, max: number) => {
  const range = max - min;

  return range * Math.random() + min;
};

const MIN_DELAY = 30 * 1000;
const MAX_DELAY = 2 * 60 * 1000;

interface DB {
  findOrCreate: <T>(id: string, defaults: T) => [boolean, T];
  updateById: (id: string, newProps: Object) => Object;
}

const searchAndUpdate = async (
  url: string,
  lookup: (url: string) => Promise<Item>,
  db: DB
) => {
  try {
    const liveItem = await lookup(url);
    const [newlyCreated, currentItem] = db.findOrCreate(url, liveItem);
    if (newlyCreated) {
      logger.info(`${liveItem.id} first lookup: sending`);
      const message = `First update: ${liveItem.id}-${liveItem.status}\n${liveItem.url}`;
      await webhook(message);
    } else {
      // have a record of it, let's see if it's been updated
      if (liveItem.status !== currentItem.status) {
        const partialMessage = `${currentItem.title} updated: ${currentItem.status} -> ${liveItem.status}`;
        logger.info(partialMessage);
        await webhook(`${partialMessage}\n${liveItem.url}`);
        db.updateById(url, liveItem);
      }
    }
  } catch (err) {
    logger.error(err);
  }
  // queue up again for some time later...
  setTimeout(
    searchAndUpdate,
    randomNumber(MIN_DELAY, MAX_DELAY),
    url,
    lookup,
    db
  );
};

export default (urls: string[], db: DB) => {
  const lookups = constructExtractorMappings(urls);
  for (const url of urls) {
    searchAndUpdate(url, lookups, db);
  }
};
