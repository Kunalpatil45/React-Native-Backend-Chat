import { Router, Request, Response } from "express";
import User from "../model/User.js";

const router = Router();

interface SaveTokenBody {
  userId: string;
  token: string;
}

router.post("/save-token", async (req: Request<{}, {}, SaveTokenBody>, res: Response) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        msg: "userId and token required",
      });
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { pushTokens: token }, // prevents duplicates
    });

    return res.json({
      success: true,
      msg: "Token saved",
    });

  } catch (err) {
    console.log("Save token error:", err);

    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

export default router;