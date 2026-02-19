import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import router from "./routes/auth.routes";
import { initializeSocket } from "./socket/socket";
import http from "http"

const app = express();


app.use(cors());
app.use(express.json());

app.use(router)


app.get("/", (req, res) => {
  res.send("Hello World!");
});


const server = http.createServer(app);
initializeSocket(server);  

connectDB();

server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
