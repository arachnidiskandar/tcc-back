import { addMonths, addWeeks, differenceInMonths, differenceInWeeks } from 'date-fns';

export const getDatesBetweenByMonth = (startDate: Date, endDate: Date): Date[] => {
  const months = differenceInMonths(endDate, startDate);

  return [...Array(months + 1).keys()].map((i) => addMonths(startDate, i));
};

export const getDatesBetweenByWeek = (startDate: Date, endDate: Date): Date[] => {
  const weeks = differenceInWeeks(endDate, startDate);

  return [...Array(weeks + 1).keys()].map((i) => addWeeks(startDate, i));
};
