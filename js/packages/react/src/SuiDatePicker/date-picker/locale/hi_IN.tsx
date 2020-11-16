import CalendarLocale from 'rc-picker/lib/locale/hi_IN';
import TimePickerLocale from 'antd/lib/time-picker/locale/hi_IN';
import { PickerLocale } from '../generatePicker';

// Merge into a locale object
const locale: PickerLocale = {
  lang: {
    placeholder: 'तारीख़ चुनें',
    rangePlaceholder: ['प्रारंभ तिथि', 'समाप्ति तिथि'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json

export default locale;