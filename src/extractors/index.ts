import {BestBuyExtractor} from './Bestbuy';
export {BestBuyExtractor} from './Bestbuy';
import {GiftgiftExtractor} from './Giftgift';
export {GiftgiftExtractor} from './Giftgift';
import {PokemonCenterExtractor} from './PokemonCenter';
export {PokemonCenterExtractor} from './PokemonCenter';

import {Extractor, Item} from './IExtractor';
export {Extractor, Item} from './IExtractor';

// add any new extractors here and everything should work as normal
const extractors = [
  BestBuyExtractor,
  PokemonCenterExtractor,
  GiftgiftExtractor,
] as const;

class NoMatchingExtractor extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const getExtractor = (url: string): Extractor => {
  const extractor = extractors.find(ex => ex.isValidUrl(url));
  if (!extractor) {
    throw new NoMatchingExtractor(`Could not find extractor for ${url}`);
  }
  return extractor;
};
