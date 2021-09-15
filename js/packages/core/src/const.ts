import moment, {Moment} from "moment";

export const NO_DATA_TEXT = "н/д";

/**
 * Get most popular calendar ranges
 */
export function GET_DEFAULT_CALENDAR_RANGES(): { [range: string]: [Moment, Moment] } {
// noinspection NonAsciiCharacters
  return {
    "Сегодня": [moment().startOf('day'), moment().endOf('day')],
    "Последние 7 дней": [moment().startOf('day').subtract(7, "days"), moment().endOf('day')],
    "Последние 30 дней": [moment().startOf('day').subtract(30, "days"), moment().endOf('day')],
    "Последние 90 дней": [moment().startOf('day').subtract(90, "days"), moment().endOf('day')],
    "Последние 365 дней": [moment().startOf('day').subtract(365, "days"), moment().endOf('day')],
    "Текущая неделя": [moment().startOf("week"), moment().endOf("week")],
    "Текущий месяц": [moment().startOf("month"), moment().endOf("month")],
    "Текущий квартал": [moment().startOf("quarter"), moment().endOf("quarter")],
    "Текущий год": [moment().startOf("year"), moment().endOf("year")],
    "Последние 3 года": [moment().startOf('day').subtract(3, "years"), moment().startOf('day')]
  };
}

