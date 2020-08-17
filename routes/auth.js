const express = require("express");
var bcrypt = require("bcryptjs");
const sellerUser = require("../models/seller");
const buyerUser = require("../models/buyer")
const app = express();




//Seller register
app.post("/registerSeller",async (req,res) => {
  try {
        const sellerUsers = await sellerUser.create(req.body)
        req.session.userid = sellerUsers._id;
        // res.status(201).json({ success : true , user : sellerUsers})
        res.redirect("/")
  } catch (error) {
        res.status(500).json({ success : false , error : error.message })
  }
})

//Login seller
app.post("/loginseller", async (req,res) => {
  try {
        const sellerUsers = await sellerUser.findOne({ email : req.body.email }).select('+password')
        if(!sellerUsers){
          return res.status(400).json({ success: false, error: "provide correct email" });
        }

        const checkpass = await sellerUsers.compairHash(req.body.password);
        if(!checkpass){
          return res.status(400).json({ success: false, error: "provide correct password" });
        }

        req.session.userid = sellerUsers._id;
        
        res.redirect("/")
  } catch (error) {
        res.status(500).json({ success : false , error : error.message })
  }
})

//Register Buyer
app.post("/registerbuyer",async (req,res) => {
  try {
    const buyerusers = await buyerUser.create(req.body)
    req.session.userid = buyerusers._id;
    res.redirect("/")
  } catch (error) {
    res.status(500).json({ success : false , error : error.message })
  }
})

//Login Buyer
app.post("/loginbuyer", async (req, res) => {
  try {
    const buyerusers = await buyerUser.findOne({ email: req.body.email }).select('+password')
    if(!buyerusers){
      return res.status(400).json({ success : false , error : "Please provide correct email"})
    }

    const checkpass = await buyerusers.compairHashpass(req.body.password)
    if(!checkpass){
      return res.status(400).json({ success: false, error: "Please provide correct password" })
    }
  
    req.session.userid = buyerusers._id;
    return res.redirect("/")

  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})


module.exports = app;
