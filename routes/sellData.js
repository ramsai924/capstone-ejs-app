const express = require("express")
const multer = require("multer")
const path = require("path")
const flash = require('connect-flash')
const sellData = require("../models/seller_data_table")
const app = express()

//redurect to login
const redirectLogin = (req, res, next) => {
    if (!req.session.userid) {
        res.redirect("/welcome");
    } else {
        next();
    }
};

//redirect to home
const redirectHome = (req, res, next) => {
    if (req.session.userid) {
        res.redirect("/");
    } else {
        next();
    }
};

//multer
var storage = multer.diskStorage({
    destination : './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var uploads = multer({ storage: storage }).single("images");


// //get all users Scrap data (development)
// app.get("/getAllScrap",async (req,res) => {
//     try {
//        const scarpData = await sellData.find({ orderStatus : "active"}).populate([
//          { path: "userid", model: "seller_user_table", select: "-soldHistory" }
//        ]);

//        res.status(200).json({ success : true , scarpData })
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// })



//add scrap data
app.post("/", uploads,async (req,res) => {
    try {
        console.log(req.file)
          const data = req.body;
          data.image = req.file.path;

          const scarpData = await sellData.create(data);
        req.flash('message', 'Data posted success')
          res.redirect("/")
        } catch (error) {
        res.status(500).json({ success : false , error : error.message })
    }
})

//get update edit details
app.get("/update/:id",redirectLogin,async (req,res) => {
    try {
        const scrapeData = await sellData.findById({ _id : req.params.id })
        console.log(scrapeData)
        
        res.render("editScrape", { sellerData: scrapeData, message: req.flash('message') })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})


//update scrap data
app.post("/update/:id", uploads, async function(req,res) {
    try {

        console.log(req.file)
        if (req.file) {
            var data = req.body;
            data.image = req.file.path;
        } else {
            var data = req.body;
        }
        
        const updateScrap = await sellData.findByIdAndUpdate({ _id : req.params.id } , data , { new : true , runValidators : true })
        req.flash('message', 'Details updated')
        res.redirect("/")
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

app.get("/delete/:id", async (req,res) => {
    try {
        const seletescrape = await sellData.findByIdAndDelete({ _id: req.params.id })
        req.flash('message', 'Details deleted')
        res.redirect("/")
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

module.exports = app;