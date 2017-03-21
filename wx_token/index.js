var later = require('later');
var mysql = require('mysql');
var https = require('https');
var moment = require('moment');

//建立数据库连接
var connection = mysql.createConnection({
    host: '115.28.78.73',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'wechat'
});

var appid = "wx0e94a9ed781a2ce8";
var appsecret = "73e39051ec2f07c0d20b39b8cfade946";
var access_token;

later.date.localTime();
console.log("Now:" + new Date());

var sched = later.parse.recur().every(1).hour();//设置每小时执行
next = later.schedule(sched).next(10);
console.log(next);

var timer = later.setInterval(test, sched);
setTimeout(test, 2000);//程序运行2秒钟后，执行一次要被周期调度的函数。

function test() {
    console.log(new Date());
    var options = {
        hostname: 'api.weixin.qq.com',
        path: '/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + appsecret
    };
    var req = https.get(options, function (res) {
        //console.log("statusCode: ", res.statusCode);
        //console.log("headers: ", res.headers);
        var bodyChunks = '';
        res.on('data', function (chunk) {
            bodyChunks += chunk;
        });
        res.on('end', function () {
            var body = JSON.parse(bodyChunks);
            //console.dir(body);
            if (body.access_token) {
                access_token = body.access_token;
                saveAccessToken(access_token);
                console.log(access_token);
            } else {
                console.dir(body);
            }
        });
    });
    req.on('error', function (e) {
        console.log('ERROR: ' + e.message);
    });
}

 function saveAccessToken(accessToken) {    
     var postData = {
         AccessToken: accessToken,
         Date: moment().format('YYYY-MM-DD HH:mm:ss')
     };
    
    connection.connect();
    connection.query('INSERT INTO `WeChatToken` SET ?', postData, function (err, result) {
        if (err) {
            console.log(JSON.stringify(err));
            connection.end();
        }
 
        if (result && result.affectedRows == 1) {
            console.log("success");
        }
    });
    connection.end();
}