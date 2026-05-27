require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const realTimeServer = require("./realTimeServer");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();
const httpServer = createServer(app);

connectDB();

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(require("./routes"));

app.use(express.static(path.join(__dirname, "public")));

httpServer.listen(app.get("port"), () => {
  console.log("La aplicación esta corriendo en el puerto ", app.get("port"));
});

realTimeServer(httpServer);