export class Event<T> {
  name: string
  payload: T

  constructor(name: string, payload: T = null) {
    this.name = name;
    this.payload = payload;
  }

}
