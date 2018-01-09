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

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
var databaseUrl = "new_york_times";
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
    db.news.find({}, function(error, found) {
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

      $(".story-meta").each(function(i, element) {

          var title = $(element).children(".headline").text().replace("\n", "").replace("                    ", "").replace("                ", "");
          var desc = $(element).children(".summary").text();

          db.news.insert({
              title: title,
              desc: desc,
              saved: false
          });
          limit++;
          if(limit === 10) return false;
      });

      // Log the results once you've looped through each of the elements found with cheerio
      res.send("Scrape Complete");
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
