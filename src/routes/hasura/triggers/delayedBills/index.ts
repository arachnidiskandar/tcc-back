import { startOfToday } from 'date-fns';
import { Request, Response } from 'express';
import { gql } from 'graphql-request';

import client from '../../../../graphql/client';

const SetDelayedBills = gql`
  mutation SetDelayedBills($today: date) {
    update_payments(
      where: { isPaid: { _eq: false }, isDelayed: { _eq: false }, date: { _lt: $today } }
      _set: { isDelayed: true }
    ) {
      affected_rows
    }
  }
`;

const delayedPaymentsTrigger = async (req: Request, res: Response) => {
  try {
    await client.request(SetDelayedBills, { today: startOfToday() });
    return res.status(200).json();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export default delayedPaymentsTrigger;
