import React from 'react';
import {IRawRoute, UserService} from "@sui/core";
import {Redirect} from "react-router-dom";
import {Location} from 'history';
import {checkAuthority} from "@/access";
import {Exception403} from "@/exception";
import {useService} from "@/hooks";

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
}

export default Authorized;
