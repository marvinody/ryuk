import {config} from 'dotenv';
config();

import jsonc from './util/jsonc';

const path = require('path');
const BESTBUY_SKU_FILE = path.join(__dirname, '..', 'bestbuy-skus.jsonc');
const bestbuySkus = jsonc(BESTBUY_SKU_FILE);

import {findOrCreate, updateById} from './db';
import logger from './util/logger';

import bot from './bot';

logger.info('STARTING BOT');
bot(bestbuySkus, {findOrCreate, updateById});
