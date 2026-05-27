import { Router } from "express";
import { registerUser, loginUser ,forgetPassword, verifyOtp, resetPassword , notifyPushTokenUpdate} from "../Controllers/auth.controller.js";


const router = Router();

router.post('/register', registerUser);

router.post('/update-push-token', notifyPushTokenUpdate);

router.post('/login', loginUser);

router.post('/forgot-password', forgetPassword);

router.post('/verify-otp', verifyOtp);

router.post('/reset-password', resetPassword);

export default router;