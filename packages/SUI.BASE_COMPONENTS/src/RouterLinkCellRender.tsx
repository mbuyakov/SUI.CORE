import {concatDataKey, DataKey, getDataByKey} from "@smsoft/sui-core";
import * as React from 'react';

import { RouterLink, RouterLinkType } from './RouterLink';

interface IRouterLinkCellRenderRet {
  dataKey?: DataKey
  // tslint:disable-next-line:no-any
  groupingCriteria(value: any): any;
  // tslint:disable-next-line:no-any
  render?(value: any, row: any): React.ReactNode;
}

export function routerLinkCellRender(
  // tslint:disable-next-line:no-any
  link: (id: any) => string,
  params?: {
    baseKey?: DataKey,
    idKey?: DataKey,
    monospace?: boolean,
    renderKey?: DataKey,
    type?: RouterLinkType,
    valueKey?: DataKey,
  }): IRouterLinkCellRenderRet {
  const idKey = (params && params.idKey && [params.baseKey, params.idKey]) || ['id'];
  const renderKey = params && (params.renderKey || params.valueKey);
  const textKey = params && renderKey && [params.baseKey, renderKey];
  const ret: IRouterLinkCellRenderRet = {
    // tslint:disable-next-line:no-any
    groupingCriteria: (value: any): any => value,
    // tslint:disable-next-line:no-any
    render: (value: any, row: any): React.ReactNode => {
      const id = getDataByKey(row, ...idKey);
      if (!id) {
        return null;
      }

      return (
        <RouterLink
          to={link(id)}
          text={textKey ? getDataByKey(row, ...textKey) : value}
          type="button"
          monospace={params && params.monospace}
        />
      );
    },
  };

  if (params && params.valueKey) {
    ret.dataKey = concatDataKey(params.baseKey, params.valueKey);
  }

  return ret;
}
