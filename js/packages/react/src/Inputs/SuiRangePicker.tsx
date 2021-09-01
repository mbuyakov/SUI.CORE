/* eslint-disable @typescript-eslint/no-explicit-any */
import {Nullable, wrapInArray} from "@sui/core";
import {DatePicker} from "antd";
import classNames from "classnames";
import * as React from 'react';
import {v4 as uuidv4} from 'uuid';
import {RangePickerProps} from "@/antdMissedExport";

export type ISuiRangePickerProps = RangePickerProps & { formatter?(value: string, event: InputEvent): string };

export function SuiRangePicker(props: ISuiRangePickerProps): JSX.Element {
  const {formatter, ...rangePickerProps} = props;

  const classForSearch = React.useMemo(() => `SuiRangePicker-${uuidv4()}`, []);

  React.useEffect((): void => {
    const pickerRoot = document.getElementsByClassName(classForSearch).item(0);

    if (pickerRoot) {
      const onInput = (event: InputEvent): void => {
        if (formatter) {
          const format = (rangePickerProps.format ? (wrapInArray(rangePickerProps.format))[0] : undefined) as Nullable<string>;

          if (format) {
            const value = (event.target as any).value as string;
            const newValue = formatter(value, event);

            if (value !== newValue) {
              (event.target as any).value = newValue
            }
          }
        }
      };

      [...pickerRoot.getElementsByClassName("ant-picker-input")]
        .flatMap(it => [...it.children] as HTMLInputElement[])
        .forEach(it => {
          it.oninput = onInput
        });
    }
  });

  return (
    <DatePicker.RangePicker
      {...rangePickerProps}
      className={classNames(rangePickerProps.className, classForSearch)}
    />
  );
}
