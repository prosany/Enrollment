const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config({});

const app = express();
const PORT = process.env.PORT || 7070;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the Express");
  res.end();
});

app.get("/status", validateHost, async (req, res) => {
  try {
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
    };
    if (amount) {
      responeToSend = {
        ...responeToSend,
        amount: numberWithCommas(data.course.price * data.enrolled),
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

app.listen(PORT, () => console.log(`Enrollment watching port ${PORT}`));

// separate number with commas
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// validate host or domain
function validateHost(req, res, next) {
  try {
    let whitelisted = ["localhost", "127.0.0.1:5500"];
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
