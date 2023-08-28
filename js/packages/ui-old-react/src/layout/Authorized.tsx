import React from "react";
import {IRawRoute} from "@sui/ui-old-core";
import {Redirect} from "@sui/deps-router";
import {Location} from "history";
import {Exception403} from "@sui/ui-layout";
import {useService} from "@sui/lib-hooks";
import {checkAuthority, UserService} from "@sui/lib-auth";

export const Authorized: React.FC<{
  location?: Location
  children: React.ReactElement<{ route: IRawRoute }>
}> = ({
        location,
        children
      }) => {

  const userService = useService(UserService);

  const redirect = (
    <Redirect
      to={{
        pathname: "/login",
        state: location ? `${location.pathname}${location.search || ""}` : undefined
      }}
    />
  );

  const authority = children?.props?.route?.authority;

  const hasAuthority = !authority || checkAuthority(authority);

  return (
    userService.isLoggedIn()
      ? (
        (hasAuthority)
          ? children
          : (<Exception403/>)
      ) : redirect
  );
};

export default Authorized;
