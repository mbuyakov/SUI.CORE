import React from "react";

import {getUser} from "./utils";

export interface IRoleVisibilityWrapperProps<T = React.ReactNode> {
  content: T;
  forbiddenComponent?: T;
  roles: string[];
}

export function hasAnyRole(roles: string[]): boolean {
  const userRoles = getUser().roles || []; // Б - Безопасность

  return userRoles.includes("ADMIN") || userRoles.some(role => roles.includes(role));
}

export function roleVisibilityWrapper<T>(props: IRoleVisibilityWrapperProps<T>): T {
  return hasAnyRole(props.roles) ? props.content : (props.forbiddenComponent || null);
}
