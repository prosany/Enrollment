const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config({});
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 7070;

app.use(
  cors({
    origin: ["https://enroll.msls.one"],
    methods: "GET",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new MongoClient(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get("/", (req, res) => {
  res.send("Welcome to Enroll Statistics");
  res.end();
});

app.get("/status", validateHost, async (req, res) => {
  try {
    const db = client.db("enrollment");
    const coll = db.collection("views");
    const result = await coll.findOne({
      _id: ObjectId("63964c4090ccb4b057e1a707"),
    });

    const { amount } = req.query;
    const { data: response } = await axios.get(process.env.GET_URL, {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
    });
    const { data } = response;

    let responeToSend = {
      id: data.course.courseId,
      name: data.course.title,
      startedAt: data.course.registrationStartDate,
      endsOn: data.course.registrationEndDate,
      enrolled: data.enrolled,
      price: data.course.price,
      outline: data.course.whatYouWillLearn,
      totalView: retirement(parseFloat(result.totalCount)),
    };
    if (amount) {
      responeToSend = {
        ...responeToSend,
        amount: 0,
        symbol: "৳",
      };
    }

    res.status(200).send(responeToSend);
    res.end();
  } catch (error) {
    res.status(500).send({ error: error.message });
    res.end();
  }
});

app.get("/updateViews", validateHost, async (req, res) => {
  try {
    const db = client.db("enrollment");
    const coll = db.collection("views");
    coll.findOneAndUpdate(
      { _id: ObjectId("63964c4090ccb4b057e1a707") },
      {
        $inc: {
          totalCount: 1,
        },
      },
      {
        returnOriginal: false,
        upsert: true,
      }
    );
    res.status(201).send({ status: 1, message: "Updated views" });
    res.end();
  } catch (error) {
    res.status(500).send({ status: 0, message: error.message });
    res.end();
  }
});

app.listen(PORT, () => console.log(`Enrollment watching port ${PORT}`));

// separate number with commas
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// validate host or domain
function validateHost(req, res, next) {
  try {
    let whitelisted = ["enroll.msls.one"];
    let origin = req.get("origin");
    let host = replaceHttp(origin);

    if (whitelisted.includes(host)) {
      next();
    } else {
      res.status(403).send({ status: 0, message: "You don't have access." });
      res.end();
    }
  } catch (error) {
    res.status(500).send({ status: 0, message: "You don't have access." });
    res.end();
  }
}

// replace http:// or https:// with regex
function replaceHttp(url) {
  return url.replace(/http:\/\/|https:\/\//, "");
}

// retirement capital
function retirement(num) {
  if (num > 999 && num < 1000000) {
    return (num / 1000).toFixed(1) + "K";
  } else if (num > 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num < 900) {
    return num;
  }
}
