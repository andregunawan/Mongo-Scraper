// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

// Initialize Express
var app = express();

app.use(express.static("public"));

var port = process.env.PORT || 3000;

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
var databaseUrl = "mongodb://heroku_4stsk567:ch0123luba1ser0v1q48ct7tk1@ds251277.mlab.com:51277/heroku_4stsk567";
var collections = ["news"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
    res.redirect(req.baseUrl + "/all");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
    db.news.find().sort({natural:-1}, function(error, found) {
        var allArticlesObj = {
            articles: found
        };
        console.log(allArticlesObj);
        res.render("home", allArticlesObj);
    });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request for the news section of nyt
  request("https://www.nytimes.com/section/sports?module=SectionsNav&action=click&version=BrowseTree&region=TopBar&contentCollection=Sports&pgtype=sectionfront", function(error, response, html) {

      var $ = cheerio.load(html);

      var results = [];
      var limit = 0;
      var getTitle = "";

      $(".story-meta").each(function(i, element) {
            getTitle = $(element).children(".headline").text().replace("\n", "").replace("                    ", "").replace("                ", "");
            return false;
        });
        db.news.findOne({title:getTitle}, function(error, found) {
          if(!found)
          {
            $(".story-meta").each(function(i, element) {

                var title = $(element).children(".headline").text().replace("\n", "").replace("                    ", "").replace("                ", "");
                var desc = $(element).children(".summary").text();

                db.news.insert({
                    title: title,
                    desc: desc,
                    saved: false
                });
                limit++;
                if(limit === 20) return false;
            });
            res.send("Scrape Complete");
          }
        });
    });
});

app.get("/saved", function(req, res) {
    db.news.find({saved:true}, function(error, found) {
        var allArticlesObj = {
            articles: found
        };
        console.log(allArticlesObj);
        res.render("saved_articles", allArticlesObj);
    });
});

app.post("/saveArticle/:id", function(req, res) {
    var ObjectId = mongojs.ObjectID;
    db.news.findAndModify({query:{_id:ObjectId(req.params.id)}, update:{$set:{saved: true}}}, function(error, found) {
        res.send("Save Article - Success!");
    });
});

app.post("/deleteArticle/:id", function(req, res) {
    var ObjectId = mongojs.ObjectID;
    db.news.findAndModify({query:{_id:ObjectId(req.params.id)}, update:{$set:{saved: false}}}, function(error, found) {
        res.send("Delete Article Success!");
    });
});

app.get("/addNotes/:id", function(req, res) {
    db.comments.find({newsId:req.params.id}, function(error, found) {
        var notesObj = {
            id: req.params.id,
            notes: found
        };
        console.log(notesObj);
        res.send(notesObj);
    });
});

app.post("/insertNotes", function(req, res) {
    var id = req.query.id;
    var notes = req.query.notes;
    db.comments.insert({newsId:id, notes: notes}, function(error, found) {
        res.send("Insert Success!" + notes);
    });
});

app.post("/removeNotes/:id", function(req, res) {
    var ObjectId = mongojs.ObjectID;
    db.comments.remove({_id:ObjectId(req.params.id)}, function(error, found) {
        res.send("Remove Success!");
    });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
