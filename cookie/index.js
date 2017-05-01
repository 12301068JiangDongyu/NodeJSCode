var express = require('express');
var cookieParser = require('cookie-parser');

var app = express();
//app.use(cookieParser());

app.use(cookieParser('saddsafwerqsdaf'));

app.get('/read',function(req,res,next){
	res.json(req.cookies);
});

app.get('/abc',function(req,res,next){
	res.json(req.cookies);
});

app.get('/write',function(req,res,next){
	//res.cookie('my_cookie','hello',{domain:'www.abc.com',path: '/abc'});
	//res.cookie('my_cookie','hello',{expires: new Date(Date.now() + 2*60*1000)});//2min后过期
	//res.cookie('my_cookie','hello',{maxAge: 2*60*1000 });//2min后过期
	res.cookie('a','221');
	res.cookie('b','456',{httpOnly:true,signed:true});
	res.json(req.signedCookies);
});

app.listen(3000);
console.log("Server running at port: 3000");