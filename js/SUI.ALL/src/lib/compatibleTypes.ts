import {Moment} from "moment";
import React from "react";

export type RangePickerValue = [Moment | null, Moment | null];

export declare type RawValueType = string | number;

// tslint:disable-next-line:interface-name
export interface LabelValueType {
  halfChecked?: boolean;
  key?: string | number;
  label?: React.ReactNode;
  value?: RawValueType;
}
export declare type DefaultValueType = RawValueType | RawValueType[] | LabelValueType | LabelValueType[];
