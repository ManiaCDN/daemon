
var mysql = require('mysql');

var config = require('./config');

var pool = mysql.createPool({
    connectionLimit: 10,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    host: config.db.host
});

module.exports = {};
module.exports.pool = pool;

module.exports.makeConnection = function (callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        return callback(null, connection);
    });
};
