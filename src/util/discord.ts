import axios from 'axios';
import logger from './logger';

export const makeWebhook = (url: string | undefined, username?: string) => {
  if (url === undefined) {
    throw new Error('UNDEFINED DISCORD WEBHOOK URL');
  }

  return async (message: string) => {
    await axios.post(url, {
      username,
      content: message,
    });
    logger.debug('Update sent to discord');
  };
};
