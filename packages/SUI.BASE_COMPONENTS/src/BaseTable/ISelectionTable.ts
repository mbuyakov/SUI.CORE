export type defaultSelection = number | string;

export interface ISelectionTable<T> {
  clearSelection(): void;

  getSelection(): T[];
}
