export const SYSTEM_USER_ID = -1;

export interface ICoreUser<META = Record<string, never>> {
  accessToken: string;
  id: string | number;
  name: string;
  roles: string[];
  metadata?: META;
}
