import React from "react";

import {getUser} from "./utils";

export interface IRoleVisibilityWrapperProps<T = React.ReactNode> {
  content: T;
  forbiddenComponent?: T;
  roles: string[];
}

export function roleVisibilityWrapper<T>(props: IRoleVisibilityWrapperProps<T>): T {
  const userRoles = getUser().roles || []; // Б - Безопасность
  const isAllowed = userRoles.includes("ADMIN") || userRoles.some(role => props.roles.includes(role));

  return isAllowed ? props.content : (props.forbiddenComponent || null);
}
