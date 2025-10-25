const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Order Service API",
    description: "Auto generated Swagger docs",
    version: "1.0.0",
  },
  host: "localhost:6004",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/orderRoutes.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
