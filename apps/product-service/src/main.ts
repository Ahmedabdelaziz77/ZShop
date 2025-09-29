import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddelware } from "packages/error-handler/error-middleware";
import router from "./routes/productRoutes";

import swaggerUi from "swagger-ui-express";
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
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello Product API" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

// routes
app.use("/api", router);

app.use(errorMiddelware);

const port = process.env.PORT || 6002;
const server = app.listen(port, () => {
  console.log(`Product service listening at http://localhost:${port}/api`);
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});
server.on("error", (err) => {
  console.log("Server Error :", err);
});
