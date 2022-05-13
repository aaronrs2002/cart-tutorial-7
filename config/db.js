const mysql = require("mysql2");


const db = mysql.createPool({
    connectionLimit: 1000,
    connectionTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 100,
    host: "XXXXX",
    user: "XXXXX",
    database: "XXXXX",
    password: "XXXXX",
    port: 3306

});

module.exports = db;