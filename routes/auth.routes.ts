import { Router } from "express";
import { registerUser, loginUser, getRoute } from "../Controllers/auth.controller";


const router = Router();

router.post('/register', registerUser);

router.post('/getConsole', getRoute);

router.post('/login', loginUser);

export default router;