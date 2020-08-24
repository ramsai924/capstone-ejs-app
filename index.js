const express = require("express")
const app = express()

//required
const db = require("./config/db")

//packages
const bodyparser = require('body-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const path = require('path')
const flash = require('connect-flash')
const MongoStore = require("connect-mongo")(session);

//routes
const Auth = require("./routes/auth")
const addScrap = require("./routes/sellData")
const foundUsers = require("./routes/users")


app.set('view engine','ejs')

//set cookie
app.use(
  session({
    name: "sid",
    resave: false,
    saveUninitialized: false,
    secret: "iromman batman",
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      sameSite: true,
      secure: false,
    },
  })
);

//body parser
app.use(bodyparser.urlencoded({ extended : false }))
app.use(express.json())
app.use(flash())

app.use('/public', express.static(path.join(__dirname, 'public')))

//use routes
app.use("/", foundUsers)
app.use("/auth", Auth);
app.use("/addscarp", addScrap)


//PORT
const port = process.env.PORT || 4000;
app.listen(port,() => {
    console.log(`Listening to port : ${port}`)
})