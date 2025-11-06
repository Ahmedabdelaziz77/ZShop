import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send({ message: "Welcome to recommendation-service!" });
});

const port = process.env.PORT || 6007;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
