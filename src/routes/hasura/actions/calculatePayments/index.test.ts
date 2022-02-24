import { addDays, addMonths, addYears, startOfToday } from 'date-fns';

import { BillRepeatType, createPaymentsList, ICreatePaymentsArgs } from '.';

describe('#createPaymentsList', () => {
  const pastDueDate = new Date('01-01-2022');
  const currentDayDueDate = startOfToday();
  const futureDueDate = addDays(currentDayDueDate, 1);
  const baseBill = {
    billId: 'id',
    billValue: 10,
    userId: 'userId',
  };
  const threeMonthsFromNow = addMonths(currentDayDueDate, 3);
  const oneMonthFromNow = addMonths(currentDayDueDate, 1);
  describe('Payment doenst repeat', () => {
    it('should create payment already delayed', () => {
      const bill: ICreatePaymentsArgs = {
        ...baseBill,
        dueDate: pastDueDate,
      };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(1);
      expect(payments[0]).toStrictEqual({
        date: pastDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: true,
      });
    });
    it('should create payment with due date of current day', () => {
      const bill: ICreatePaymentsArgs = {
        ...baseBill,
        dueDate: currentDayDueDate,
      };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(1);
      expect(payments[0]).toStrictEqual({
        date: currentDayDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
    });
    it('should create payment with due date in the future', () => {
      const bill: ICreatePaymentsArgs = {
        ...baseBill,
        dueDate: futureDueDate,
      };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(1);
      expect(payments[0]).toStrictEqual({
        date: futureDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
    });
  });
  describe('Repeat type once month', () => {
    const baseBillMonthly = {
      ...baseBill,
      repeatType: BillRepeatType.MONTHLY,
    };
    it('should create payments already with due date in the past', () => {
      const bill: ICreatePaymentsArgs = { ...baseBillMonthly, dueDate: pastDueDate, repeatForever: true };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(13);
      expect(payments[0]).toStrictEqual({
        date: pastDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: true,
      });
    });
    it('should create payments with due date of the current day', () => {
      const bill: ICreatePaymentsArgs = { ...baseBillMonthly, dueDate: currentDayDueDate, repeatForever: true };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(13);
      expect(payments[0]).toStrictEqual({
        date: currentDayDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
    });
    it('should create payments with due date in the future', () => {
      const bill: ICreatePaymentsArgs = { ...baseBillMonthly, dueDate: futureDueDate, repeatForever: true };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(13);
      expect(payments[0]).toStrictEqual({
        date: futureDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
    });
    it('should create payments with final date', () => {
      const bill: ICreatePaymentsArgs = {
        ...baseBillMonthly,
        dueDate: currentDayDueDate,
        repeatForever: false,
        repeatUpTo: threeMonthsFromNow,
      };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(4);
      expect(payments[0]).toStrictEqual({
        date: currentDayDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
      expect(payments[3]).toStrictEqual({
        date: addMonths(currentDayDueDate, 3),
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
    });
  });
  describe('Repeat type once week', () => {
    const baseBillWeekly = {
      ...baseBill,
      repeatType: BillRepeatType.WEEKLY,
    };
    it('should create payments already with due date in the past', () => {
      const bill: ICreatePaymentsArgs = { ...baseBillWeekly, dueDate: pastDueDate, repeatForever: true };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(53);
      expect(payments[0]).toStrictEqual({
        date: pastDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: true,
      });
    });
    it('should create payments with due date of the current day', () => {
      const bill: ICreatePaymentsArgs = { ...baseBillWeekly, dueDate: currentDayDueDate, repeatForever: true };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(53);
      expect(payments[0]).toStrictEqual({
        date: currentDayDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
    });
    it('should create payments with due date in the future', () => {
      const bill: ICreatePaymentsArgs = { ...baseBillWeekly, dueDate: futureDueDate, repeatForever: true };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(53);
      expect(payments[0]).toStrictEqual({
        date: futureDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
    });
    it('should create payments without final date', () => {
      const bill: ICreatePaymentsArgs = {
        ...baseBillWeekly,
        dueDate: currentDayDueDate,
        repeatForever: false,
        repeatUpTo: oneMonthFromNow,
      };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(5);
      expect(payments[0]).toStrictEqual({
        date: currentDayDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
      expect(payments[4]).toStrictEqual({
        date: addMonths(currentDayDueDate, 1),
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
    });
  });
  describe('Repeat type once year', () => {
    const baseBillYearly = {
      ...baseBill,
      repeatType: BillRepeatType.YEARLY,
    };
    it('should create payments already with due date in the past', () => {
      const bill: ICreatePaymentsArgs = { ...baseBillYearly, dueDate: pastDueDate, repeatForever: true };
      const payments = createPaymentsList(bill);
      console.log(payments);
      expect(payments.length).toBe(2);
      expect(payments[0]).toStrictEqual({
        date: pastDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: true,
      });
    });
    it('should create payments with due date of the current day', () => {
      const bill: ICreatePaymentsArgs = { ...baseBillYearly, dueDate: currentDayDueDate, repeatForever: true };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(2);
      expect(payments[0]).toStrictEqual({
        date: currentDayDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
    });
    it('should create payments with due date in the future', () => {
      const bill: ICreatePaymentsArgs = { ...baseBillYearly, dueDate: futureDueDate, repeatForever: true };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(2);
      expect(payments[0]).toStrictEqual({
        date: futureDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
    });
    it('should create payments without final date', () => {
      const bill: ICreatePaymentsArgs = {
        ...baseBillYearly,
        dueDate: currentDayDueDate,
        repeatForever: true,
        repeatUpTo: oneMonthFromNow,
      };
      const payments = createPaymentsList(bill);
      expect(payments.length).toBe(2);
      expect(payments[0]).toStrictEqual({
        date: currentDayDueDate,
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
      expect(payments[1]).toStrictEqual({
        date: addYears(currentDayDueDate, 1),
        billId: 'id',
        userId: 'userId',
        value: 10,
        isPaid: false,
        isDelayed: false,
      });
    });
  });
});
