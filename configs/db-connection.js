require("dotenv").config();

const mysql = require("mysql2");
const mysql2 = require("mysql");

const connection = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	port: process.env.DATABASE_PORT,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE, 
	charset: "utf8mb4",
});

const connection2 = mysql.createConnection({ //mysql2.crea~
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	port: process.env.DATABASE_PORT,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE, 
	charset: "utf8mb4",
});

module.exports = { connection, connection2 };
