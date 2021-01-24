import axios from 'axios';
import logger from './logger';

const {USERNAME, WEBHOOK_URL} = process.env;

export const webhook = async (message: string) => {
  if (!WEBHOOK_URL) {
    logger.error('WEBHOOK_URL is not defined, not sending update');
    return;
  }

  await axios.post(WEBHOOK_URL, {
    username: USERNAME,
    content: message,
  });
  logger.debug('Update sent to discord');
};
