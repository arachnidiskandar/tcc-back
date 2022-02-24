import { Router } from 'express';

import { loginController, signUpController } from './auth';
import hasuraRoutes from './hasura';

const appRoutes = Router();

appRoutes.use('/hasura', hasuraRoutes);
appRoutes.post('/auth/login', loginController);
appRoutes.post('/auth/signup', signUpController);

export default appRoutes;
