import React, {useContext} from "react";
import {List} from "@sui/deps-material";
import {BasicLayoutContext} from "@/layout/BasicLayoutContext";
import {RouteListItem} from "@/layout/RouteListItem";

export const DrawerRoutes: React.FC = () => {
  const {routes} = useContext(BasicLayoutContext);

  return (
    <List disablePadding={true}>
      {routes.map(it => (
        <RouteListItem
          isSubItem={false}
          route={it}
          key={it.path}
        />
      ))}
    </List>
  );
};
