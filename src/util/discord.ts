import axios from 'axios';
import logger from './logger';

export const makeWebhook = (url: string | undefined, username?: string) => {
  if (url === undefined) {
    throw new Error('UNDEFINED DISCORD WEBHOOK URL');
  }

  return async (message: string | DiscordEmbed) => {
    if (typeof message === 'string') {
      await axios.post(url, {
        username,
        content: message,
      });
    } else {
      await axios.post(url, {
        username,
        embeds: [message],
      });
    }
    logger.debug('Update sent to discord');
  };
};

export type DiscordEmbed = {
  url: string;
  title: string;
  color?: string;
  image?: {
    url: string;
  };
  description: string;
};
