const mongoose = require('mongoose')
//mongodb+srv://capstoneejs:capstoneejs@cluster0.nhuzf.mongodb.net/capstone-ejs-app?retryWrites=true&w=majority
//mongodb://localhost:27017/recycling
const db = mongoose
  .connect("mongodb+srv://capstoneejs:capstoneejs@cluster0.nhuzf.mongodb.net/capstone-ejs-app?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("conneted to recycling db");
  })
  .catch((error) => {
    console.log(error);
  });

module.exports = db;