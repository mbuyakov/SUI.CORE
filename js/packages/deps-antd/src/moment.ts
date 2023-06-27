import type {Moment} from 'moment';
import momentGenerateConfig from 'rc-picker/lib/generate/moment';
import generatePicker, {PickerProps} from 'antd5/es/date-picker/generatePicker';
import generateCalendar from "antd5/es/calendar/generateCalendar";
import {RangePickerProps as BaseRangePickerProps} from "antd5/es/date-picker/generatePicker";

export const DatePicker = generatePicker<Moment>(momentGenerateConfig);
export type DatePickerProps = PickerProps<Moment>;
export const Calendar = generateCalendar<Moment>(momentGenerateConfig);
export type RangePickerProps = BaseRangePickerProps<Moment>;
