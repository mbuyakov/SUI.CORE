import {AuthorityList, Privilege} from "./types";
import {Container} from "@sui/deps-ioc";
import {UserService} from "./UserService";
import {ICoreUser} from "./user";

export const getUser = <META = Record<string, never>>(): ICoreUser<META> => {
  return Container.get(UserService).getUser<META>();
};

export const isAdmin = (): boolean => {
  return Container.get(UserService).isAdmin();
};

export const hasRole = (role: string): boolean => {
  return Container.get(UserService).hasRole(role);
};

export const hasPrivilege = (privilege: string): boolean => {
  return Container.get(UserService).hasPrivilege(privilege);
};

export const hasAnyPrivilege = (...privilege: string[]): boolean => {
  return Container.get(UserService).hasAnyPrivilege(...privilege);
};

export const getPrivileges = <T extends object = object>(privilege: string): Privilege<T>[] => {
  return Container.get(UserService).getPrivileges(privilege);
};

export const checkAuthority = (authority: AuthorityList): boolean => {
  return authority.or
    ? authority.or.some(hasPrivilege)
    : authority.and.every(hasPrivilege);
};
