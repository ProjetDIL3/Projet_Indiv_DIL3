import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { jwtUtils } from '../utils/jwtUtils';
import { csrfUtils } from '../utils/csrfUtils';

const router = Router();

router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

export const authenticateJWT = jwtUtils.authenticateJWT;
export const csrfProtection = csrfUtils.csrfProtection;

export default router;