export class SuiEvent<T> {
  name: string
  payload: T

  constructor(name: string, payload: T) {
    this.name = name;
    this.payload = payload;
  }

}
