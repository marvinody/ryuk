import {BestBuyExtractor} from './Bestbuy';
export {BestBuyExtractor} from './Bestbuy';
import {PokemonCenterExtractor} from './PokemonCenter';
export {PokemonCenterExtractor} from './PokemonCenter';

import {Extractor, Item} from './IExtractor';
export {Extractor, Item} from './IExtractor';

// add any new extractors here and everything should work as normal
const extractors = [BestBuyExtractor, PokemonCenterExtractor];

class NoMatchingExtractor extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const constructExtractorMappings = (urls: string[]) => {
  const urlToExtractor = new Map<string, Extractor>();

  urls.forEach(url => {
    const extractor = extractors.find(ex => ex.isValidUrl(url));
    if (!extractor) {
      throw new NoMatchingExtractor(`Could not find extractor for ${url}`);
    }

    urlToExtractor.set(url, extractor);
  });

  return (url: string): Promise<Item> => {
    const ext = urlToExtractor.get(url);
    if (!ext) {
      throw new Error(`Missing Extractor for ${url}`);
    }

    return ext.extract(url);
  };
};
