const express = require("express");
const env = require("dotenv");
const mongoose = require("mongoose");
const router = require("./route/routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
env.config();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//make a mongodb connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 8080;

app.use("/", router);

app.get("/", (req, res) => {
  return res.send("Welcome to Wealth Munshi");
});

app.listen(PORT, () => {
  console.log(`Wealth Munshi listening at http://localhost:${PORT}`);
});
