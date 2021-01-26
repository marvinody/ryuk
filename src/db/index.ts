const DB_FILENAME = 'shitty_db.json';

import path from 'path';
import fs from 'fs';

import logger from '../util/logger';
import cleanup from '../util/cleanup';

const DB_FILEPATH = path.join(__dirname, '..', '..', DB_FILENAME);

const emptyData = {};

const writeData = (d: Object) =>
  fs.writeFileSync(DB_FILEPATH, JSON.stringify(d, null, 2), {
    encoding: 'utf-8',
  });

let dirty = false;
const data = (() => {
  if (fs.existsSync(DB_FILEPATH)) {
    logger.info(`Reading DB: ${DB_FILEPATH}`);
    const rawString = fs.readFileSync(DB_FILEPATH).toString();
    return JSON.parse(rawString);
  } else {
    writeData(emptyData);
    logger.info(`Creating DB: ${DB_FILEPATH}`);
    return emptyData;
  }
})();

// returns array of [created, rowAsObject]
export const findOrCreate = <T>(id: string, defaults: T): [boolean, T] => {
  if (data[id]) {
    return [false, data[id]];
  }
  data[id] = defaults;
  dirty = true;
  return [true, defaults];
};

// updates (merges) passed in props to an object at certain id
export const updateById = (id: string, newProps: Object) => {
  data[id] = {
    ...data[id],
    ...newProps,
  };
  dirty = true;
  return data[id];
};

export const flush = () => {
  if (dirty) {
    writeData(data);
    dirty = false;
    logger.info('Writing data');
  }
};

// Add a cleanup handler to just write data if necessary
cleanup(flush);
