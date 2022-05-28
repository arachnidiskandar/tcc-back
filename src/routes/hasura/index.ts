import { Router } from 'express';

import createPaymentsAction from './actions/calculatePayments';
import delayedPaymentsTrigger from './triggers/delayedBills';
import salarySnapshotTrigger from './triggers/salarySnapshot';

const hasuraRoutes = Router();

hasuraRoutes.post('/create-payments', createPaymentsAction);
hasuraRoutes.post('/set-delayed-payments', delayedPaymentsTrigger);
hasuraRoutes.post('/salary-snapshot', salarySnapshotTrigger);

export default hasuraRoutes;
