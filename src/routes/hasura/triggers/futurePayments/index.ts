import { differenceInMonths, addMonths, setYear, getYear, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Request, Response } from 'express';
import { gql } from 'graphql-request';

import client from '../../../../graphql/client';
import { getDatesBetweenByMonth, getDatesBetweenByWeek } from '../../../../helpers';
import { BillRepeatType, IPaymentsList } from '../../actions/calculatePayments';

interface IBillResponse {
  id: string;
  dueDate: string;
  repeatType: BillRepeatType | null;
  userId: string;
  billValue: number;
}
const insertFutureBills = gql`
  mutation MyMutation($objects: [payments_insert_input!]!) {
    insert_payments(objects: $objects, on_conflict: { constraint: payments_pkey }) {
      affected_rows
    }
  }
`;

const getInfiniteBills = gql`
  query getInfiniteBills {
    bills(where: { repeatForever: { _eq: true } }) {
      id
      dueDate
      repeatType
      userId
      billValue
    }
  }
`;

const createFuturePayments = (bill: IBillResponse): IPaymentsList[] => {
  const { dueDate, id: billId, billValue, userId, repeatType } = bill;
  const currentYear = getYear(new Date());
  const rangeStart = setYear(startOfDay(parseISO(dueDate)), currentYear);
  const rangeEnd = addMonths(endOfDay(rangeStart), 7);

  if (BillRepeatType.YEARLY === repeatType) {
    const nextYearDueDate = setYear(new Date(dueDate), currentYear + 1);
    if (differenceInMonths(nextYearDueDate, rangeEnd) <= 6) {
      return [
        {
          date: nextYearDueDate,
          value: billValue,
          billId,
          userId,
          isPaid: false,
          isDelayed: false,
        },
      ];
    }
  }
  if (BillRepeatType.MONTHLY === repeatType) {
    const listOfDatesByMonth = getDatesBetweenByMonth(rangeStart, rangeEnd);
    return listOfDatesByMonth.map((date) => ({
      date,
      value: billValue,
      billId,
      userId,
      isPaid: false,
      isDelayed: false,
    }));
  }
  if (BillRepeatType.WEEKLY === repeatType) {
    const listOfDatesByWeek = getDatesBetweenByWeek(rangeStart, rangeEnd);
    return listOfDatesByWeek.map((date) => ({
      date,
      value: billValue,
      billId,
      userId,
      isPaid: false,
      isDelayed: false,
    }));
  }
};

const futurePaymentsTrigger = async (req: Request, res: Response) => {
  try {
    const { bills } = await client.request(getInfiniteBills);
    const payments = bills.map((bill) => createFuturePayments(bill)).flat();
    const variables = {
      objects: payments,
    };
    await client.request(insertFutureBills, variables);
    return res.status(200).json();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export default futurePaymentsTrigger;
