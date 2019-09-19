import {DropResult} from 'react-smooth-dnd';

export function applyDrag<T>(arr: T[], dragResult: DropResult, mapFn?: (item: T) => T): T[] {

  const {removedIndex, addedIndex, payload} = dragResult;
  if (removedIndex === null && addedIndex === null) {
    return arr;
  }

  const result = [...arr];
  let itemToAdd = payload;

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0];
  }

  if (mapFn) {
    itemToAdd = mapFn(itemToAdd);
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd);
  }

  return result;

}
