import {getSUISettings} from "@sui/core/es/core";
import {AuthorityList} from "@sui/core";
import {getUser, isAdmin} from "@/utils";

//
// Взаимодействие с ACCESS_RIGHTS
//

export function hasPrivilege(key: string): boolean {
  const ACCESS_RIGHTS = getSUISettings().ACCESS_RIGHTS;

  return isAdmin()
    ? true
    : getUser().roles.some(role => (ACCESS_RIGHTS[role] || [] as any[]).some(privilege => privilege.key === key));
}

export function hasAnyPrivilege(...keys: string[]): boolean {
  return keys.some(hasPrivilege);
}

export function checkAuthority(authority: AuthorityList): boolean {
  return authority.or
    ? authority.or.some(hasPrivilege)
    : authority.and.every(hasPrivilege);
}

export function getPrivileges<T extends {}>(roles: string[], ...keys: string[]): Array<T & { key: string }> {
  const keySet = new Set(keys);
  const ACCESS_RIGHTS = getSUISettings().ACCESS_RIGHTS;

  return roles
    .flatMap(role => ACCESS_RIGHTS[role] || [])
    .filter(privilege => keySet.has(privilege.key));
}


