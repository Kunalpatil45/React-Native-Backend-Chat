import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import router from "./routes/auth.routes.js";
import { initializeSocket } from "./socket/socket.js";
import http from "http"
import pushTokenRoute from './routes/pushToken.route.js'
const app = express();


app.use(cors());
app.use(express.json());
app.use("/",pushTokenRoute);
app.use(router)


app.get("/", (req, res) => {
  res.send("Hello World!");
});


const server = http.createServer(app);
initializeSocket(server);  

connectDB();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
