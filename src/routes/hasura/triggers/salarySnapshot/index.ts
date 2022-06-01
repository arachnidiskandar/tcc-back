import { startOfMonth, sub } from 'date-fns';
import { Request, Response } from 'express';
import { gql } from 'graphql-request';

import client from '../../../../graphql/client';

interface IGetUsersSalariesResponse {
  id: string;
  salary: number | null;
  // eslint-disable-next-line camelcase
  additionalSalary_aggregate: {
    aggregate: { sum: { value: number | null } };
  };
}
const getUsersSalaries = gql`
  query GetSalaryUserFromMonth($startMonth: date, $endMonth: date) {
    users {
      id
      salary
      additionalSalary_aggregate(where: { date: { _gte: $startMonth, _lte: $endMonth } }) {
        aggregate {
          sum {
            value
          }
        }
      }
    }
  }
`;

const insertSalarySnapshot = gql`
  mutation CreateSalaryMonthSnapshot($objects: [salarySnapshot_insert_input!]!) {
    insert_salarySnapshot(objects: $objects, on_conflict: { constraint: salary_snapshot_pkey }) {
      affected_rows
    }
  }
`;

const calculateSalaryMonth = (users: IGetUsersSalariesResponse[], lastDayLastMonth: Date) => {
  const usersWithSalary = users.map((user) => {
    const totalSalaryMonth = user?.salary + user.additionalSalary_aggregate.aggregate.sum.value;
    return { userId: user.id, salary: totalSalaryMonth, date: lastDayLastMonth };
  });
  return usersWithSalary;
};

const salarySnapshotTrigger = async (req: Request, res: Response) => {
  const startMonth = startOfMonth(new Date());
  const startOfLastMonth = sub(startMonth, { months: 1 });
  const endOfLastMonth = sub(startMonth, { days: 1 });
  try {
    const { users } = await client.request(getUsersSalaries, {
      startMonth: startOfLastMonth,
      endMonth: endOfLastMonth,
    });
    const variables = {
      objects: calculateSalaryMonth(users, endOfLastMonth),
    };
    await client.request(insertSalarySnapshot, variables);
    return res.status(200).json();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export default salarySnapshotTrigger;
