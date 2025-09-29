const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Product Service API",
    description: "Auto generated Swagger docs",
    version: "1.0.0",
  },
  host: "localhost:6002",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/productRoutes.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
