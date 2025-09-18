import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"
import {userRouter} from "./src/routes/user.routes.js"
import journalRouter from "./src/routes/journal.routes.js";
const app = express()

app.use(cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true // Allows cookies to be sent/received
  }))
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())


app.use('/user',userRouter);

app.use("/api/journal", journalRouter);

export {app}