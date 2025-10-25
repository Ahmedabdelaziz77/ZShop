import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
// import swaggerUi from "swagger-ui-express";
// import axios from "axios";
import cookieParser from "cookie-parser";
import initializeSiteConfig from "./libs/initializeSiteConfig";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req, res) => ipKeyGenerator(req.ip as string),
});
app.use(limiter);

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

app.use(
  "/product",
  proxy("http://localhost:6002", {
    proxyReqPathResolver: (req) => {
      return req.originalUrl.replace(/^\/product/, "");
    },
    proxyErrorHandler: (err, res, next) => {
      console.error("Product proxy error:", err?.code || err?.message, err);
      next(err);
    },
  })
);
app.use("/order", proxy("http://localhost:6004"));
app.use("/", proxy("http://localhost:6001"));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log("Site config initialized successfully");
  } catch (err) {
    console.error("Failed to initialize site configs!", err);
  }
});
server.on("error", console.error);
