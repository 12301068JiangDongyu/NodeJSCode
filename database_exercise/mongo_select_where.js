var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://localhost:27017/mynode';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  if(err) throw err;
  console.log("Connected correctly to server");

  db.collection('user').find({"name":"zhang"}).toArray(function(err,list){
        if(err) throw err;
        console.log(list);
  });
});