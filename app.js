var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;
var path = require('path');


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.post('/uploadFile', function(req,res){
	var b64string =req.body.data;
	var buf = new Buffer(b64string, 'base64'); 
	console.log(buf);
	MongoClient.connect('mongodb://127.0.0.1:27017/imageuploadDatabase', function (err, db) {
    if (err) {
        throw err;
    } else {
        console.log("successfully connected to the database");
       
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    var url = req.protocol + "://" + req.get('host') + "/views/uploaded/:"+text;
     var data ={
        	image : buf,
        	randomString : text
        };
 


        	db.collection('myCol').insert(data, function(err, bsonData) {

        	                if (err) {
        	                    res.send({ msg:'Error saving your file to the database!' });
        	                }else{
        	                	console.log(bsonData);
        	                  		res.send({msg: 'success',url: url});
        	                }
        	            });
        	        
      }
       
    db.close();
});



});

app.get('/views\/uploaded\/:randomString', function(req,res){

	var string = req.params.randomString.substring(1);
	console.log(string);
	MongoClient.connect('mongodb://127.0.0.1:27017/imageuploadDatabase', function (err, db) {
    if (err) {
        throw err;
    } else {
        console.log("successfully connected to the database");
        
        	 db.collection('myCol', function(err, collection) {
             collection.find({'randomString' : string}).toArray(function(err, items) {
             	console.log(items);
             	var base64data = new Buffer(items[0].image.buffer, 'binary').toString('base64');
             	console.log("sadsa "+base64data);
             	var data = "data:image/png;base64,"+base64data;
              	var html = "<html>Your Image : <div><img src='"+data+"' height='500' width='500'/></div></html>"
  				res.writeHeader(200, {"Content-Type": "text/html"});  
  				res.write(html);  
  				res.send();
             });
         });
        	        
      }
       
    db.close();
   });

});
app.get('/image-uploader', function(req, res) {
	console.log("hre");
    res.sendFile(path.join(__dirname + '/ImageFileUploader.html'));
});



app.listen(8080, function () {
  console.log('Image Uploader app listening on port 8080!')
})