import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";

// Create express app using HTTP server
const app = express();
const server = http.createServer(app);

// Middlewares
app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/api/status", (req, res) => {
  res.send("server is live");
});

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});
