import {Moment} from "moment";
import React from "react";

export type RangePickerValue = [Moment | null, Moment | null];

export declare type RawValueType = string | number;

export interface LabelValueType {
  halfChecked?: boolean;
  key?: string | number;
  label?: React.ReactNode;
  value?: RawValueType;
}
export declare type DefaultValueType = RawValueType | RawValueType[] | LabelValueType | LabelValueType[];
