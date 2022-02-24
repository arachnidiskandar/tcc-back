import { Router } from 'express';

import createPaymentsAction from './actions/calculatePayments';
import delayedPaymentsTrigger from './triggers/delayedBills';

const hasuraRoutes = Router();

hasuraRoutes.post('/create-payments', createPaymentsAction);
hasuraRoutes.post('/set-delayed-payments', delayedPaymentsTrigger);

export default hasuraRoutes;
