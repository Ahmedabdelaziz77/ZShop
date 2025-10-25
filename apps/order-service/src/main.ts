import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import { errorMiddelware } from "packages/error-handler/error-middleware";

import swaggerUi from "swagger-ui-express";
import router from "./routes/orderRoutes";
import { createOrder } from "./controller/orderController";
const swaggerDocument = require("./swagger-output.json");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to order-service!" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

app.get("/", (req, res) => {
  res.send({ message: "Welcome to order-service!" });
});

// routes

app.use("/api", router);
app.use(errorMiddelware);
app.post(
  "/api/create-order",
  bodyParser.raw({ type: "application/json" }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    console.log("🟡 Stripe webhook received at:", new Date().toISOString());
    next();
  },
  createOrder
);
const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  console.log(`Order service listening at http://localhost:${port}/api`);
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});
server.on("error", (err) => {
  console.log("Server Error :", err);
});
