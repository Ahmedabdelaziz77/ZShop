const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Seller Service API",
    description: "Auto generated Swagger docs",
    version: "1.0.0",
  },
  host: "localhost:6004",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/sellerRoutes.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
