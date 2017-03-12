var MongoClient = require("mongodb").MongoClient
var ObjectID = require("mongodb").objectID;
var express = require("express");
var bodyparser = require('body-parser');
var app = new  express();
app.use(bodyparser.urlencoded({ extended: false }));



const BASE64_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
const R64Arr = BASE64_ALPHABET.split("");
const R64Dict = {};
for (i = 0; i < 64; i++) {
    R64Dict[R64Arr[i]] = i
}

const getRandomCode = function () {
    randCode =
        // 2 digit number with 6 zeros
        (((Math.random() * 100) << 0) * 1000000)
        +
        //current milliseconds (cutting off last 2 digits), 6-digit
        (((new Date().getTime() / 100) << 0) % 1000000);
    return randCode;

};

function myconvert64(num, str)
{
	if(num <= 0)
		return str;
	else
	{
		mod = num % 64;
		str = BASE64_ALPHABET.charAt(mod) + str;
		return myconvert64(Math.floor(num/64), str);
	}
}

function convertFrom64(givenString) {
    digits = givenString.split("").reverse();
    sum = 0;
    for (i = 0; i < digits.length; i++) {
        sum += (getInt(digits[i])) * (Math.pow(64, i));
    }
    return sum;
}




var path = require('path');
 
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.post('/api/v1/shorten', function(req, res){

	var url = req.body.url;
	var rcode = getRandomCode();
	var code = myconvert64(rcode, "");

	console.log(url);
	console.log(code);

	MongoClient.connect("mongodb://localhost:27017/student", function(err, db){
	if(!err){
		console.log("Connected to student Database");

		db.collection('urlshortner').insertOne(	{ "URL" : url , "CODE" : code, }, function(err, result){
			if(!err)
				console.log("inserted document!");
			else
				console.log("something went wrong!");
			
		});

		res.send("localhost:20000/"+code);
		db.close();
		
	}
	else
		console.log("DATABASE Error");
	
});
})

app.get('/:shortcode', function(req, res){
	var code = req.params.shortcode;
	MongoClient.connect("mongodb://localhost:27017/student", function(err, db){
	if(!err){
		console.log("Connected to student Database");

		var cursor = db.collection('urlshortner').find({ "CODE" : code });
		url = null;
		cursor.each(function(err, doc){
			if(doc != null){
				url = doc.URL;
			}
		});
		res.redirect(302, "http://codechef.com");
		db.close();
		
	}
	else
		console.log("DATABASE Error");
	
});
});

app.use(express.static("public"));
app.use(express.static("images"));
app.use('/', express.static( __dirname + "public"));

app.listen(20000);




