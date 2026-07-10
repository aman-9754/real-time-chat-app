import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/user.route.js";

// Create express app using HTTP server
const app = express();
const server = http.createServer(app);

// Middlewares
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Routes setup
app.use("/api/status", (req, res) => {
  res.send("server is live");
});

app.use("/api/auth", userRouter);

// connect to the mongodb database
await connectDB();

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});
