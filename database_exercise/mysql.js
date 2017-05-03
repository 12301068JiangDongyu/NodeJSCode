var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'mynode',
  password: '123456',
  database: 'mynode'
});

connection.connect(function (err) {
  if (err) throw err;
  // connection.query('SELECT * FROM user', function (err, ret) {
  //   if (err) throw err;
  //   console.log(ret);
  //   connection.end();
  // });

  var value = 'zhang';
  //var value = 'zhang" OR "1"="1';
  //var query =  connection.query('SELECT * FROM user where name="'+value+'"', function (err, ret) {
  var query =  connection.query('SELECT * FROM user where name=?',value, function (err, ret) {  
    if (err) throw err;

    console.log(ret);
    connection.end();
  });

  console.log(query.sql);

});