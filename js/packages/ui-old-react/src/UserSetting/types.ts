/* eslint-disable @typescript-eslint/ban-types */
export type ICreateUserFormValues<T extends {}> = T & {
  name: string;
  email: string;
  username: string;
  password: string;
  roleIds: string[];
};

export type IMainInfoUserValues<T extends {}> = T & {
  name: string;
  email: string;
  username: string;
};
