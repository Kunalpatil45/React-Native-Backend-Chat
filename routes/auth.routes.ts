import { Router } from "express";
import { registerUser, loginUser ,forgetPassword, verifyOtp, resetPassword} from "../Controllers/auth.controller.js";


const router = Router();

router.post('/register', registerUser);


router.post('/login', loginUser);

router.post('/forgot-password', forgetPassword);

router.post('/verify-otp', verifyOtp);

router.post('/reset-password', resetPassword);

export default router;