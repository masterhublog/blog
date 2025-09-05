export interface TocItem {
  id: string;
  text: string;
  children?: TocItem[];
}