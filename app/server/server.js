var express = require("express");
var elasticsearch = require("elasticsearch");
var root = express();
var app = express();

app.use(express.static("client"));

app.use(express.static("node_modules"));

app.get("/service/applicants", function(req, res) {

// // possible changes to work with local the host to hosts, added [] and added the local to the host list
// app.get("/service/search", function(req, res) {
  var client = new elasticsearch.Client({
    host: 'interns.dataworks-inc.com/elasticsearch'
  });

  client.search({
    index: 'sample_json',
    q: req.params.query || '*'
  }).then(function (body) {
    var hits = body.hits.hits.map(function(hit) { return hit._source; });;
    res.json(hits);
  }, function (error) {
    console.trace(error.message);
  });
});

//code for favorites
// app.post("/service/favorites", function(req, res) {
  
// })

root.get("/", function(req, res) {
  res.redirect("/app");
});

root.use('/app', app);

//HTML5 mode
app.all('/*', function(req, res) {
  res.sendFile('index.html', {root: __dirname + "/../client/"});
});

var server = root.listen(8082, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})




//   res.json([{
//     "name": "Joe Schweitzer",
//     "score": 0.99,
//     "currentEntity": "Data Works Inc.",
//     "currentLocation": "Reston, VA",
//     "skills": ["Grails", "Groovy", "Ext JS"]
//   }, {
//     "name": "Laura Schweitzer",
//     "score": 0.98,
//     "currentEntity": "Data Works Inc.",
//     "currentLocation": "Reston, VA",
//     "skills": ["Pentaho", "Ruby on Rails", "Javascript"]
//   }, {
//     "name": "Dave Mezzetti",
//     "score": 0.30,
//     "currentEntity": "Data Works Inc.",
//     "currentLocation": "Reston, VA",
//     "skills": ["Scala", "Spark", "Tweeting"]
//   }, {
//     "name": "Dennis Schweitzer",
//     "score": 0.58,
//     "currentEntity": "Data Works Inc.",
//     "currentLocation": "Reston, VA",
//     "skills": ["Pentaho", "Ruby on Rails", "Javascript"]
//   }]);
// });