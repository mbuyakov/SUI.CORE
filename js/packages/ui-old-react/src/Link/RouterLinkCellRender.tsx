/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

import {concatDataKey, DataKey, getDataByKey} from '@sui/ui-old-core';

import {RouterLink, RouterLinkType} from './RouterLink';

interface IRouterLinkCellRenderRet {
  dataKey?: DataKey

  groupingCriteria(value: any): any;

  render?(value: any, row: any): React.ReactNode;
}

export function routerLinkCellRender(
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
    groupingCriteria: (value: any): any => value,
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
