export const SYSTEM_USER_ID = -1;

export interface ICoreUser {
  /**
   *   User Bearer access token
   */
  accessToken: string;
  /**
   *   User id
   */
  id: string | number;
  /**
   *   User name (i.e. username or email)
   */
  name: string;
  /**
   *   User roles (with ROLE_ prefix)
   */
  roles: string[];
}
