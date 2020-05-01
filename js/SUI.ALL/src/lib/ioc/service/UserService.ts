import { Inject, OnlyInstantiableByContainer, Singleton } from 'typescript-ioc';
import { getUser } from '../../utils';
import { LocalStorageService } from './LocalStorageService';
import { Nullable } from '../../other';

@OnlyInstantiableByContainer
@Singleton
class UserService {

  @Inject
  private localStorageService: LocalStorageService;

  public getToken(): Nullable<string> {
    return this.localStorageService.getItem('token');
  }

  public setToken(token: string): void {
    this.localStorageService.setItem('token', token);
  }

  public getId(): string {
    getUser()
  }

  public login() {

  }

  public logout() {

  }

}
