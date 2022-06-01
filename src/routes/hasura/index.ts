import { Router } from 'express';

import createPaymentsAction from './actions/calculatePayments';
import delayedPaymentsTrigger from './triggers/delayedBills';
import futurePayments from './triggers/futurePayments';
import salarySnapshotTrigger from './triggers/salarySnapshot';

const hasuraRoutes = Router();

hasuraRoutes.post('/create-payments', createPaymentsAction);
hasuraRoutes.post('/future-payments', futurePayments);
hasuraRoutes.post('/set-delayed-payments', delayedPaymentsTrigger);
hasuraRoutes.post('/salary-snapshot', salarySnapshotTrigger);

export default hasuraRoutes;
