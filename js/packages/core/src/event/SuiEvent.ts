export class SuiEvent<EVENT_NAME extends string, T> {
  name: EVENT_NAME
  payload: T

  constructor(name: EVENT_NAME, payload: T) {
    this.name = name;
    this.payload = payload;
  }

}
