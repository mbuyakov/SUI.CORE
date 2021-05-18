export const ROLE_PREFIX = 'ROLE_';

export function formatRoleName(roleName: string): string {
  return roleName.replace(ROLE_PREFIX, '');
}

export type RouteType = 'card' | 'table';

export interface IRawRoute {
  actions: {
    title: string;
    onClick(): void;
  }
  authority: string[];
  breadcrumb: string;
  breadcrumbFn: Promise<string>;
  cardForEntity?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  group: true;
  icon: string;
  name: string;
  notTab: boolean;
  path: string;
  pathFn: string;
  routes?: IRawRoute[];
  tableForEntity?: string[];
  tabs: boolean;
}
