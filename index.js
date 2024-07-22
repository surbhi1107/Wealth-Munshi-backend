const express = require("express");
const cors = require("cors");
const env = require("dotenv");
const mongoose = require("mongoose");
const router = require("./route/routes");
const bodyParser = require("body-parser");

env.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

//make a mongodb connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 8080;

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Wealth Munshi listening at http://localhost:${PORT}`);
});
