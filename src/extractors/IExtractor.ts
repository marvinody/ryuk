export type Item = {
  store: string;
  url: string;
  id: string;
  title: string;
  status: string;
};

export interface Extractor {
  isValidUrl(url: string): boolean;
  _TestUrls: string[];
  extract(url: string): Promise<Item>;
}
