var express = require('express');
var app = express();

//required for POST method
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: true}); //for parsing form data
app.use(urlencodedParser);

//Templates
//app.set('view engine', 'ejs');

app.use(express.static('public'));


app.listen(80, function () {
  console.log('Example app listening on port 80!')
});