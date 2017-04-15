var express = require('express');
var router = express.Router();
var app = express();
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');


/* GET home page. */
router.get('/', function(req, res, next) {
    Post.get(null, function (err, posts) {
        if (err) {
            posts = [];
        }
        res.render('index', {
            title: 'Home',
            //posts: posts,
            current: 'home',
            posts: posts
        });
    });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function (req, res) {
    res.render('reg', {
        title: 'Register',
        current: 'register',
    })
});

router.get('/login', checkNotLogin);
router.get('/login', function (req, res) {
    res.render('login', {
        title: 'login',
        current: 'login',
    });
});

router.get('/logout', checkLogin);
router.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '退出成功');
    res.redirect('/');
})

router.get('/user', function (req, res) {
    res.render('user', {
        title: '用户页面'
    })
})

router.post('/login', checkNotLogin);
router.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.pwd).digest('base64');
    
    User.get(req.body.user, function (err, user) {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/login');
        }

        if(user.password != password) {
            req.flash('error', '用户名或密码错误');
            return res.redirect('/login');
        }
        req.session.user = user;
        req.flash('success', req.session.user.name + '登录成功');

        res.redirect('/');
    })
})

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res, next) {
    console.log('body: ', req.body);
    // console.log(req.body['password-repeat']);
    if(req.body['pwda'] != req.body['pwd']) {
        req.flash('error', '两次输入的密码不一致');
        return res.redirect('/reg');
    }

    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.pwd).digest('base64');

    var newUser = new User({
      name: req.body.user,
      password: password,
    });

    User.get(newUser.name, function (err, user) {
        if (user) {
            err = "Username already exists.";
        }
        if (err) {
            req.flash('error', err);
            return res.redirect('/reg');
        }
        newUser.save(function (err) {
            if(err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            req.flash('success!', req.session.user.name + "注册成功");
            res.redirect('/');
        })
    })
});


router.post('/post', checkLogin);
router.post('/post', function (req, res) {
    var currentUser = req.session.user;
    var post= new Post(currentUser.name, req.body.post);
    post.save(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '发表成功');
        res.redirect('/u/' + currentUser.name);
    })
})

router.get('/u/:user', checkLogin);
router.get('/u/:user', function (req, res) {
    User.get(req.params.user, function (err, user) {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/');
        }
        Post.get(user.name, function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('user', {
                title: user.name,
                posts: posts
            })
        })
    })
})

function checkNotLogin (req, res, next) {
    if (req.session.user) {
        req.flash('error', '用户已经登录');
        return res.redirect('/');
    }
    next();
}

function checkLogin (req, res, next) {
    if (!req.session.user) {
        req.flash('error', '用户尚未登录');
        return res.redirect('./login');
    }
    next();
}
module.exports = router;
