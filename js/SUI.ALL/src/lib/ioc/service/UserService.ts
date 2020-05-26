import { OnlyInstantiableByContainer, Singleton } from 'typescript-ioc';
import { Nullable } from '../../other';
import { ICoreUser } from '../../user';
// Don't touch import
// noinspection ES6PreferShortImport
import { LocalStorageValue } from '../annotation/LocalStorageValue';

@OnlyInstantiableByContainer
@Singleton
export class UserService {

  @LocalStorageValue("token")
  private token: Nullable<string>;

  private user: Nullable<ICoreUser>;

  public getToken(): Nullable<string> {
    return this.token;
  }

  public getUser(): ICoreUser {
    if (this.user == null) {
      throw new Error("User not initialized");
    }
    return this.user;
  }

  public setUser(user: ICoreUser): void {
    this.token = user.accessToken;
    this.user = user;
  }
}
