//import Express Router
import { Router } from 'express';

//import public package controller
import { getPackages } from '../../controllers/public/package.controller.js';

//create a new router instance
const router = Router();

//Customer captive portal can only view packages

router.get('/', getPackages);

export default router;