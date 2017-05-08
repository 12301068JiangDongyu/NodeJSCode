//加载依赖库
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var session = require('express-session');
var moment = require('moment');
var flash = require('connect-flash');
var Waterline = require('waterline');
var mysqlAdapter = require('sails-mysql');
var mongoAdapter = require('sails-mongo');
//引入mongoose
var mongoose = require('mongoose');

//引入模型
var models = require('./models/models');
var checkLogin = require('./checkLogin.js');

var Model = require('./models/model');

// 适配器
var adapters = {
    mongo: mongoAdapter,
    mysql: mysqlAdapter,
    default: 'mongo'
};

// 连接设置
var connections = {
    mongo: {
        adapter: 'mongo',
        url: 'mongodb://localhost:27017/notes'
    },
    mysql: {
        adapter: 'mysql',
        url: 'mysql://root:123456@localhost/notes'
    }
};

var orm = new Waterline();

// 加载数据集合
orm.loadCollection(Model.User);

var config = {
    adapters: adapters,
    connections: connections
}

var ModelsInstance;

orm.initialize(config, function(err, Models){
    if(err) {
        console.error('orm initialize failed.', err)
        return;
    }

    ModelsInstance = Models;
});

//使用mongoose连接服务
mongoose.connect('mongodb://localhost:27017/notes');
mongoose.connection.on('error',console.error.bind(console,'连接数据库失败'));

//创建express实例
var app = express();

//定义EJS模板引擎和模板文件位置
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//定义静态文件目录
app.use(express.static(path.join(__dirname,'public')));

//定义数据解析器
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//建立session模型
app.use(session({
	secret: '1234',
	name: 'mynote',
	cookie: {maxAge: 1000 * 60 * 60 * 24 * 7},//设置session的保存时间为7天
	resave: false,
	saveUninitialized: true

}));

app.use(flash());

//使用flash中存的error和success变量，加可以把它们传入locals变量中，这样所有的模板都可以拿到这个变量
app.use(function(req,res,next){
    res.locals.user=req.session.user;
    res.locals.success=req.flash('success').toString();
    res.locals.error=req.flash('error').toString();
    next();
});

var User = models.User;
var Note = models.Note;

//响应首页get请求
app.get('/',checkLogin.noLogin);
app.get('/login',checkLogin.hasLogin);
app.get('/register',checkLogin.hasLogin);
app.get('/',function(req,res){
	Note.find({author:req.session.user.username})
	    .exec(function(err,allNotes){
	    	if(err){
	    		console.log(err);
	    		return res.redirect('/');
	    	}

	    	res.render('index',{
	    		title:'首页',
		        user:req.session.user,
		        notes:allNotes
	        });
	    })
	
});

app.get('/detail/:_id',function(req,res){
	console.log('查看笔记！');
	Note.findOne({_id:req.params._id})
		.exec(function(err,art){
			if(err){
				console.log(err);
				return res.redirect('/');
			}
			if(art){
				res.render('detail',{
					title: '笔记详情',
					user: req.session.user,
					art: art,
					moment: moment

				});
			}
		});
});

app.get('/register',function(req,res){
	
		console.log('注册！');
		res.render('register',{
		    user:req.session.user,
		    title:'注册'
	    });
	
});

//post请求
app.post('/register',function(req,res){
	//req.body可以获取到表单的每项数据
	var username = req.body.username,
	    password = req.body.password,
	    passwordRepeat = req.body.passwordRepeat;

	var usernameRole = /[a-zA-Z0-9_]{3,20}$/,//用户名：只能是字母、数字、下划线的组合，长度3-20个字符
	    passwordRole = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[a-zA-Z0-9]/;//密码：长度不能少于6，必须同时包含数字、小写字母、大写字母。

	//检查用户名是否为空
	if(username.trim().length == 0){
		console.log('用户名不能为空！');
		req.flash('error','用户名不能为空！');
		return res.redirect('/register');
	}

	if(!usernameRole.test(username.trim())){
		console.log('用户名只能是字母、数字、下划线的组合，长度3-20个字符！');
		req.flash('error','用户名只能是字母、数字、下划线的组合，长度3-20个字符！');
		return res.redirect('/register');
	}

	if(password.trim().length == 0 || passwordRepeat.trim().length == 0){
		console.log('密码不能为空！');
		req.flash('error','密码不能为空！');
		return res.redirect('/register');
	}

	if(password.trim().length < 6 || passwordRepeat.trim().length < 6){
		console.log('密码至少为6位！');
		req.flash('error','密码至少为6位！');
		return res.redirect('/register');
	}

	if(!passwordRole.test(password.trim())){
		console.log('密码必须同时包含数字、小写字母、大写字母！');
		req.flash('error','密码必须同时包含数字、小写字母、大写字母！');
		return res.redirect('/register');
	}

	if(password != passwordRepeat){
		console.log('两次输入的密码不一致！');
		req.flash('error','两次输入的密码不一致！');
        return res.redirect('/register');
	}
    
    ModelsInstance.collections.user.find({username: username}).exec(function(err, user) {
    	if(err){
			console.log(err);
			return res.redirect('/register');
		}

		if(user.length != 0){
			console.log('用户名已经存在！');
			req.flash('error','用户名已经存在！');
			return res.redirect('/register');
		}

		//对密码进行md5加密
		var md5 = crypto.createHash('md5'),
		    md5password = md5.update(password).digest('hex');

		ModelsInstance.collections.user.create({username: username, password: md5password}, function(err, user) {
           if(err){
	    		console.log(err);
	    		return res.redirect('/register');
	    	}
	    	console.log('注册成功！');
	    	req.flash('success','注册成功！');
	    	return res.redirect('/');
        });

    })

	// //检查用户名是否已经存在，如果不存在，则保存该记录
	// User.findOne({username:username},function(err,user){
	// 	if(err){
	// 		console.log(err);
	// 		return res.redirect('/register');
	// 	}

	// 	if(user){
	// 		console.log('用户名已经存在！');
	// 		req.flash('error','用户名已经存在！');
	// 		return res.redirect('/register');
	// 	}

 //        //对密码进行md5加密
	// 	var md5 = crypto.createHash('md5'),
	// 	    md5password = md5.update(password).digest('hex');

	// 	//新建user对象用于保存数据
	//     var newUser = new User({
	//     	username:username,
	//     	password:md5password
	//     });

	//     newUser.save(function(err,doc){
	//     	if(err){
	//     		console.log(err);
	//     		return res.redirect('/register');
	//     	}
	//     	console.log('注册成功！');
	//     	req.flash('success','注册成功！');
	//     	return res.redirect('/');

	//     });

	// });


});

app.get('/login',function(req,res){
		console.log('登录！');
	    res.render('login',{
		    user:req.session.user,
		    title:'登录'
	    });
	
});

app.post('/login',function(req,res){
	//req.body可以获取到表单的每项数据
	var username = req.body.username,
	    password = req.body.password;

	ModelsInstance.collections.user.find({username: username}).exec(function(err, user) {
        if(err){
			console.log(err);
			return res.redirect('/login');
		}

		if(user.length == 0){
			console.log('用户名不存在!');
			req.flash('error','用户名或密码错误！');
			return res.redirect('/login');
		}

        //对密码进行md5加密
		var md5 = crypto.createHash('md5'),
		    md5password = md5.update(password).digest('hex');

        user = user[0];
        
		if(user.password !== md5password){
			console.log('密码错误！');
			req.flash('error','用户名或密码错误！');
			return res.redirect('/login');
		}
		console.log('登录成功！');
		req.flash('success','登录成功！');
		user.password = null;
		delete user.password;
		req.session.user = user;
		return res.redirect('/');

	})

	// User.findOne({username:username},function(err,user){
	// 	if(err){
	// 		console.log(err);
	// 		return res.redirect('/login');
	// 	}

	// 	if(!user){
	// 		console.log('用户名不存在!');
	// 		req.flash('error','用户名或密码错误！');
	// 		return res.redirect('/login');
	// 	}

 //        //对密码进行md5加密
	// 	var md5 = crypto.createHash('md5'),
	// 	    md5password = md5.update(password).digest('hex');

	// 	if(user.password !== md5password){
	// 		console.log('密码错误！');
	// 		req.flash('error','用户名或密码错误！');
	// 		return res.redirect('/login');
	// 	}
	// 	console.log('登录成功！');
	// 	req.flash('success','登录成功！');
	// 	user.password = null;
	// 	delete user.password;
	// 	req.session.user = user;
	// 	return res.redirect('/');

	// });

});

app.get('/quit',function(req,res){
	req.session.user = null;
	console.log('退出！');
	return res.redirect('/login');
});

app.get('/post',function(req,res){
	console.log('发布！');
	res.render('post',{
		user:req.session.user,
		title:'发布'
	});
});

app.post('/post',function(req,res){
	var note = new Note({
		title: req.body.title,
		author: req.session.user.username,
		tag: req.body.tag,
		content: req.body.content
	});

	note.save(function(err,doc){
		if(err){
			console.log(err);
			return res.redirect('/post');
		}
		console.log('文章发布成功！');
		req.flash('success','文章发布成功！');
		return res.redirect('/');
	});
});

app.get('/detail/',function(req,res){
	console.log('查看笔记！');
	res.render('detail',{
		user:req.session.user,
		title:'查看笔记'
	});
});

//监听3000端口
app.listen(3000,function(req,res){
	console.log('app is running at port 3000');
});