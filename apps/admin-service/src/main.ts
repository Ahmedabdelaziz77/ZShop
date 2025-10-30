import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import router from "./routes/adminRoutes";
import { errorMiddelware } from "packages/error-handler/error-middleware";
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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

app.get("/", (req, res) => {
  res.send({ message: "Welcome to admin-service!" });
});

app.use("/api", router);
app.use(errorMiddelware);

const port = process.env.PORT || 6005;

const server = app.listen(port, () => {
  console.log(`Admin service listening at http://localhost:${port}/api`);
  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});
server.on("error", (err) => {
  console.log("Server Error :", err);
});
