require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

//Db config
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { Schema } = mongoose;
const { model } = mongoose;

const urlSchema = new Schema({
  longurl: { type: String, required: true }
});

const Url = model("Url", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// getting the short url
app.post(
  "/api/shorturl",
  bodyParser.urlencoded({ extended: false }),
  async function (req, res){
  if(req.body.url.toString().match(/^https:/)){
    const newurl = await new Url({
      longurl: req.body.url
    });
  
  const shorturl = await newurl.save();
    
  res.json({ original_url: req.body.url, short_url: shorturl._id});
  }else{
    res.json({ error: 'invalid url' });
  }
  }
);

//redirecting to long url
app.get(
  "/api/shorturl/:short",
  function (req, res) {
    
    function getShortUrl(){
      Url.findById(req.params.short).limit(1).exec(function (err, data) {
    if (err) return console.log(err);
        console.log(data);
        res.redirect(data.longurl);
  });
    }
    getShortUrl();
  }
);

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
