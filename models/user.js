/**
 * Created by Jerry on 2017/4/6.
 */
 
 
var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
}

module.exports = User;

//存入mongodb的文档
User.prototype.save = function(callback) {
    var user = {
        name: this.name,
        password: this.password
    };

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        //读取users的集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            } else {
                //写入
                collection.ensureIndex('name', {unique: true});
                collection.insert(user, {safe: true}, function (err, user) {
                    mongodb.close();
                    callback(err, user);
                });
            }
        });
    });
};

User.get = function(username, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            } else {
                //查询name属性为username的文档
                collection.findOne({name: username}, function (err, doc) {
                    mongodb.close();
                    if (doc) {
                        //封装为User对象
                        var user = new User(doc);
                        callback(err, user);
                    } else {
                        callback(err, null);
                    }
                });
            }
        });
    });
};