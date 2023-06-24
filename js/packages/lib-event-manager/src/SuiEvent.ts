export abstract class SuiEvent {
  public readonly name: string;

  protected constructor(name: string) {
    this.name = name;
  }
}
