import { Router } from "express";
import { Login, signup } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import {profileUpdate} from "../controllers/user.controller.js"
import {verifyjwt} from "../middleware/verifyjwt.middleware.js"

const userRouter = Router();


userRouter.post("/signup", signup);
userRouter.patch("/profileUpdate",verifyjwt,upload.single("profileImage"),profileUpdate)
userRouter.post("/login",Login)

export { userRouter };
