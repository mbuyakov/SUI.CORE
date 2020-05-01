import { OnlyInstantiableByContainer, Singleton } from 'typescript-ioc';
import { InjectValue } from 'typescript-ioc/dist/decorators';

@OnlyInstantiableByContainer
@Singleton
export class LocalStorageService {
  @InjectValue('sui.projectKey')
  private projectKey: string;

  public getItem(key: string): string {
    return localStorage.getItem(`${this.projectKey}_${key}`);
  }

  public setItem(key: string, value: string): void {
    localStorage.setItem(`${this.projectKey}_${key}`, value);
  }

  public removeItem(key: string): void {
    localStorage.removeItem(`${this.projectKey}_${key}`);
  }
}
