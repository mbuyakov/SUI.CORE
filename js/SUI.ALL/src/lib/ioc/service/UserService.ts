import { OnlyInstantiableByContainer, Singleton } from 'typescript-ioc';
import axios from 'axios';
import { notification } from 'antd';
import { Nullable } from '../../other';
import { ICoreUser } from '../../user';
// Don't touch import
// noinspection ES6PreferShortImport
import { LocalStorageValue } from '../annotation/LocalStorageValue';
import { InjectLogger, Value } from '../annotation';
import { Logger } from '../utils';

@OnlyInstantiableByContainer
@Singleton
export class UserService {

  @LocalStorageValue('token')
  private token: Nullable<string>;

  @Value("sui.restUri")
  private restUri: string;

  @InjectLogger
  private log: Logger;

  private user: Nullable<ICoreUser>;

  public getToken(): Nullable<string> {
    return this.token;
  }

  public getUser(): ICoreUser {
    if (this.user == null) {
      throw new Error('User not initialized');
    }
    return this.user;
  }

  public login(user: ICoreUser): void {
    this.token = user.accessToken;
    this.user = user;
  }

  public async logout(userCommand: boolean): Promise<void> {
    if (userCommand) {
      try {
        await axios.post<boolean>(
          `${this.restUri}/api/auth/signout`,
          null,
          { headers: { Authorization: `Bearer ${this.token}` } },
        );
        this.token = null;
        this.user = null;
      } catch (e) {
        this.log.error(e, 'Logout error');
        notification.warn({ message: 'В процессе выхода произошла ошибка' });
      }
    } else {
      this.token = null;
      this.user = null;
    }
  }
}
