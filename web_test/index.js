var http = require('http');
var server = http.createServer(function(req,res){
	console.log(req.method);
	console.log(req.url);
	console.log(req.headers);
	//设置报文头信息
	res.writeHead(404,{
		'abc':'123'

	});
	//结果响应的输出
	res.end('Hello World!');

});
//监听端口
server.listen(3001);