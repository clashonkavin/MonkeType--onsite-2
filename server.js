const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const Data = require("./models/dataModel");
const cors = require("cors");

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const dbURI = "mongodb://127.0.0.1:27017/onsite-2";

mongoose
  .connect(dbURI)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

app.post("/send-data", async (req, res) => {
  const prevData = await Data.findOne({
    username: req.body.name,
  });
  console.log(req.body);
  if (prevData) {
    if (parseInt(prevData.maxwpm) < parseInt(req.body.wpm)) {
      await Data.updateOne(
        {
          username: req.body.name,
        },
        { $set: { maxwpm: req.body.wpm } }
      );
    }
    if (parseFloat(prevData.maxaccuracy) < req.body.accuracy) {
      await Data.updateOne(
        {
          username: req.body.name,
        },
        { $set: { maxaccuracy: req.body.accuracy } }
      );
    }
  } else {
    const data = new Data({
      wpm: req.body.wpm,
      accuracy: req.body.accuracy,
      username: req.body.name,
      maxwpm: req.body.wpm,
      maxaccuracy: req.body.accuracy,
    });
    data
      .save()
      .then((result) => {
        res.send(result);
      })
      .catch((err) => console.log(err));
  }
});

app.post("/recieve-data", async (req, res) => {
  const currInstancefromDB = await Data.findOne({
    username: req.body.name,
  });
  console.log(req.body.name);
  console.log(currInstancefromDB);
  res.send(JSON.stringify(currInstancefromDB));
});

app.listen(2000, () => console.log("Port Connected to 2000"));
