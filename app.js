const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const connection = require("./configs/db-connection.js").connection;

const path = require("path");
const exp = require("constants");
const cors = require("cors");

dotenv.config({ path: "./.env" });

const methodOverride = require("method-override");

app.use(methodOverride("_method"));

const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));

//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
//Parse JSON bodies (as sent by API client)
app.use(express.json());

app.use(cookieParser());
app.use(cors());

app.set("view engine", "hbs");

connection.connect((err) => {
	if (err) {
		console.log(err);
	} else {
		console.log("MYSQL connected");
	}
});

//define routes
app.use("/", require("./controllers/pages"));
app.use("/", express.static(__dirname + "/"));

app.listen(3000, () => {
	console.log("server started on Port 3000");
});

const hbs = require("hbs");
const helperFunctions = require("./configs/handlebars-helpers.js");

for (const helperName in helperFunctions) {
	hbs.registerHelper(helperName, helperFunctions[helperName]);
}
hbs.registerHelper("isEquals", (value1, value2) => {
	return value1 === value2;
});
