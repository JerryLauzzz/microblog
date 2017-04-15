/**
 * Created by Jerry on 2017/4/6.
 */

var settings = require('../settings');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var DEFAULT_PORT = 27017;

module.exports = new Db(settings.db, new Server(settings.host, settings.default_port, {}));

