var PORT = 9529;
var http = require('http');
var qs = require('qs');

var feedback = "";

var TOKEN = 'sspku';

function checkSignature(params,token){
 var key = [token,params.timestamp,params.nonce].sort().join('');
  var sha1 = require('crypto').createHash('sha1');
  sha1.update(key);

  return sha1.digest('hex') == params.signature;
}

var server = http.createServer(function(request,response){
 var query = require('url').parse(request.url).query;
 var params = qs.parse(query);

 if(!checkSignature(params,TOKEN)){
  //如果签名不对，结束请求返回
  response.end('signature end');
  return;
 }
 if(request.method == "GET"){
     //如果请求是GET，返回echostr用于通过服务器有效校验
     response.end(params.echostr);
 }else{
     //否则是微信给开发者服务器的POST请求
     var postdata = "";

     request.addListener("data",function(postchunk){
       postdata += postchunk;
     });

     //获取到了POST数据
     // request.addListener("end",function(){
     //   console.log(postdata);
     //   response.end('success');
     // });

     //获取到了POST数据
    request.addListener("end",function(){
      var parseString = require('xml2js').parseString;

      parseString(postdata, function (err, result) {
        if(!err){
          //我们将XML数据通过xml2js模块(npm install xml2js)解析成json格式
          var res = replyText(result,feedback);
          //console.log(result)
          response.end(res);
          //response.end('success');
        }
      });
    });
 }


});

server.listen(PORT);
console.log("Server running at port: " + PORT + ".");

  
 function replyText(msg, feedback){
  var msgType = msg.xml.MsgType[0];
  switch(msgType){
    case'text':
        feedback = '文本消息';
        break;
    case'image':
        feedback = '图片消息';
        break;
    case'shortvideo':
        feedback = '小视频';
        break;
    case'video':
        feedback = '视频消息';
        break;
    case'voice':
        feedback = '声音消息';
        break;
    case'location':
        feedback = '位置消息';
        break;
    case'link':
        feedback = '链接消息';
        break;
    default:
        feedback = '未知类型类型消息';
  }
  console.log(msg);

  //将要返回的消息通过一个简单的tmpl模板（npm install tmpl）返回微信
  var tmpl = require('tmpl');
  var replyTmpl = '<xml>' +
    '<ToUserName><![CDATA[{toUser}]]></ToUserName>' +
    '<FromUserName><![CDATA[{fromUser}]]></FromUserName>' +
    '<CreateTime><![CDATA[{time}]]></CreateTime>' +
    '<MsgType><![CDATA[{type}]]></MsgType>' +
    '<Content><![CDATA[{content}]]></Content>' +
    '</xml>';

  return tmpl(replyTmpl, {
    toUser: msg.xml.FromUserName[0],
    fromUser: msg.xml.ToUserName[0],
    type: 'text',
    time: Date.now(),
    content: feedback
  });
} 