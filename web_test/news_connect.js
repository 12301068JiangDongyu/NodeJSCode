var http = require('http');
var parseUrl = require('url').parse;
var connect = require('connect');	

var NEWS = {
	1:'这里是第一条新闻的内容',
	2:'这里是第二条新闻的内容',
	3:'这里是第三条新闻的内容'
};

function getNews(id){
	return NEWS[id] || '文章不存在';
}

//使用connect
var app = connect();

app.use(function(req,res,next){
	res.send = function send(html){
		res.writeHead(200,{'content-type':'text/html;charset=utf-8'});
		res.end(html);
	}
	next();
});

app.use(function(req,res,next){
	var info = parseUrl(req.url,true);
	req.pathname = info.pathname;
	req.query = info.query;
	next();
});

app.use(function(req,res,next){
	if(req.pathname === '/'){
		res.send('<ul>'+
			    '<li><a href="/news?type=1&id=1">新闻一</a></li>'+
			    '<li><a href="/news?type=1&id=2">新闻二</a></li>'+
			    '<li><a href="/news?type=1&id=3">新闻三</a></li>'+
			'</ul>');

	}else{
		next();
	}
});

app.use(function(req,res,next){
	if(req.pathname === '/'){
		res.send('<ul>'+
			    '<li><a href="/news?type=1&id=1">新闻一</a></li>'+
			    '<li><a href="/news?type=1&id=2">新闻二</a></li>'+
			    '<li><a href="/news?type=1&id=3">新闻三</a></li>'+
			'</ul>');

	}else{
		next();
	}
});

app.use(function(req,res,next){
	if(req.pathname === '/news'&&req.query.type === '1'){
		res.send(getNews(req.query.id));

	}else{
		next();
	}
});

app.use(function(req,res,next){
    res.send('<h1>文章不存在！</h1>');
});

app.listen(3001);
