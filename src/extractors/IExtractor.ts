import {DiscordEmbed} from '../util/discord';

export type Item = {
  store: string;
  url: string;
  id: string;
  title: string;
  status: string;
};

export type Extractor = {
  isValidUrl(url: string): boolean;
  _TestUrls: string[];
  extract(url: string): Promise<Item>;
  // if oldItem is undefined, then this is the first time the script is catching the item
  makeEmbed(liveItem: Item, oldItem?: Item): string | DiscordEmbed | null;
};

export const genericDiscordMessage = (
  liveItem: Item,
  oldItem?: Item
): string | DiscordEmbed | null => {
  if (!oldItem) {
    const message = `First update: ${liveItem.id}-${liveItem.status}\n${liveItem.url}`;
    return message;
  }
  // have a record of it, let's see if it's been updated
  if (liveItem.status !== oldItem.status) {
    const partialMessage = `${oldItem.title} updated: ${oldItem.status} -> ${liveItem.status}`;
    const message = `${partialMessage}\n${liveItem.url}`;
    return message;
  }

  return null;
};
