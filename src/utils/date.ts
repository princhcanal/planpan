import { isAfter, isBefore, isEqual, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";

export const isBetween = (date: Date, dateRange: DateRange) => {
  if (dateRange.to === undefined || dateRange.from === undefined) {
    return false;
  }

  date = startOfDay(date);

  return (
    isEqual(date, dateRange.from) ||
    isEqual(date, dateRange.to) ||
    (isAfter(date, dateRange.from) && isBefore(date, dateRange.to))
  );
};
