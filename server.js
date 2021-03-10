const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();


const app = express();

// import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const category = require("./routes/category");
const linkRoutes = require("./routes/link");



// connect database
mongoose
    .connect(process.env.DATABASE_CLOUD, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
    .then(() => {console.log("database successfully connect")})
    .catch((error) => {console.log(error)})





// apply middlewares
app.use(morgan("dev"));

// only allow the following url to communicate with backend
app.use(cors({origin: process.env.CLIENT_URL}));

// by default, json data is limit to 1mb
// app.use(bodyParser.json());


app.use(bodyParser.json({limit: "5mb", type: "application/json"}));



app.use("/api",authRoutes);

app.use("/api", userRoutes);
app.use("/api", category);
app.use("/api", linkRoutes);


const port = process.env.PORT || 8000;


app.listen(port, () => (console.log(`server is running on ${port}`)));