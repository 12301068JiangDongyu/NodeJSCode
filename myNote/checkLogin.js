//未登录
function noLogin(req,res,next){
	if(!req.session.user){
		console.log('抱歉，你还没登录！');
		return res.redirect('/login');//返回登录页面
	}
	next();
}

exports.noLogin = noLogin;

//已登录
function hasLogin(req,res,next){
	if(req.session.user){
		console.log('已登录，跳转到主页');
		return res.redirect('/');//返回登录页面
	}
	next();
}

exports.hasLogin = hasLogin;
