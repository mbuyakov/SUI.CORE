import {IObjectWithIndex} from "@sui/util-types";

export type Allowed<T extends object> = ({ allowed: true; } & T) | { allowed: false };

export type AuthorityList = { [key in "and" | "or"]: string[]; };

export type Privilege<EXTRA extends object = IObjectWithIndex> = EXTRA & {
  key: string
};

export type AccessRights = Record<string, Privilege[]>;
