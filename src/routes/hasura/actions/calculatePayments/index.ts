import { addYears, endOfDay, isPast, startOfDay } from 'date-fns';
import { Request, Response } from 'express';
import { gql } from 'graphql-request';

import client from '../../../../graphql/client';
import { getDatesBetweenByMonth, getDatesBetweenByWeek } from '../../../../helpers';

export enum BillRepeatType {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  WEEKLY = 'WEEKLY',
}

export interface ICreatePaymentsArgs {
  dueDate: Date;
  billId: string;
  billValue: number;
  userId: string;
  repeatType?: BillRepeatType | null;
  repeatForever?: boolean;
  repeatUpTo?: Date;
}

export interface IPaymentsList {
  date: Date;
  value: number;
  billId: string;
  userId: string;
  isPaid: boolean;
  isDelayed: boolean;
}

const insertFutureBills = gql`
  mutation MyMutation($objects: [payments_insert_input!]!) {
    insert_payments(objects: $objects, on_conflict: { constraint: payments_pkey }) {
      affected_rows
    }
  }
`;

export const createPaymentsList = (args: ICreatePaymentsArgs): IPaymentsList[] => {
  console.log(args);
  const { dueDate, billId, billValue, userId, repeatType, repeatForever, repeatUpTo } = args;

  const dueDateValue = new Date(dueDate);
  const dueDateStartRange = startOfDay(dueDateValue);
  const endDateEndRange = repeatForever ? addYears(dueDateStartRange, 1) : endOfDay(new Date(repeatUpTo));
  if (BillRepeatType.MONTHLY === repeatType) {
    const listOfDatesByMonth = getDatesBetweenByMonth(dueDateStartRange, endDateEndRange);
    return listOfDatesByMonth.map((date) => ({
      date,
      value: billValue,
      billId,
      userId,
      isPaid: false,
      isDelayed: isPast(endOfDay(date)),
    }));
  }
  if (BillRepeatType.WEEKLY === repeatType) {
    const listOfDatesByWeek = getDatesBetweenByWeek(dueDateStartRange, endDateEndRange);
    return listOfDatesByWeek.map((date) => ({
      date,
      value: billValue,
      billId,
      userId,
      isPaid: false,
      isDelayed: isPast(endOfDay(date)),
    }));
  }
  if (BillRepeatType.YEARLY === repeatType) {
    const listOfDatesByYear = [dueDateStartRange, endDateEndRange];
    return listOfDatesByYear.map((date) => ({
      date,
      value: billValue,
      billId,
      userId,
      isPaid: false,
      isDelayed: isPast(endOfDay(date)),
    }));
  }
  return [
    { date: dueDate, billId, userId, value: billValue, isPaid: false, isDelayed: isPast(endOfDay(dueDateValue)) },
  ];
};

const createPaymentsAction = async (req: Request, res: Response) => {
  console.log(req);
  const params: ICreatePaymentsArgs = req.body.input;
  const variables = {
    objects: createPaymentsList(params),
  };
  try {
    await client.request(insertFutureBills, variables);
    return res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export default createPaymentsAction;
