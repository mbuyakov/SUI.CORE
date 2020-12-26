import {Container} from "typescript-ioc";
import {Nullable} from "@/other";

export class LocalStorageService {

  private projectKey = Container.getValue("sui.projectKey");

  public getItem(key: string): Nullable<string> {
    return localStorage.getItem(`${this.projectKey}_${key}`);
  }

  public setItem(key: string, value: string): void {
    localStorage.setItem(`${this.projectKey}_${key}`, value);
  }

  public removeItem(key: string): void {
    localStorage.removeItem(`${this.projectKey}_${key}`);
  }
}
