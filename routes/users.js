const express = require("express");
const sellerData = require("../models/seller_data_table")
const sellerUser = require("../models/seller")
const acceptedOrder = require("../models/acceptedOrders")
const Buyer = require("../models/buyer")
const app = express();


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



app.get("/welcome",redirectHome,async (req,res) => {
  try {
      res.render("welcome")
  } catch (error) {
    console.log(error)
  }
})


//getuser details home page
app.get("/",redirectLogin,async (req, res) => {
  try {
   
      const seller = await sellerUser.findById({ _id: req.session.userid })
        .populate({ path: "soldHistory", model: "seller_table_data" })
      if (seller) {
        const userData = await sellerData.find({ userid : req.session.userid , orderStatus: "active"})
        const acceptedOrders = await acceptedOrder.find({ sellerid: req.session.userid }).populate([
          { path: "soldDataId", model: "seller_table_data" },
          { path: "buyerid", model: "buyer_user_model", select: "-completedOrders"}
        ])
        console.log(seller)
        return res.render("home", { user: seller, userData: userData , acceptedOrders  })
      }

      const buyer = await Buyer.findById({ _id: req.session.userid })
        .populate([
          { path: "acceptedOreders", model: "seller_table_data", populate : { path: "userid", model: "seller_user_table" } },
          { path: "completedOrders", model: "seller_table_data" }
        ])
      if (buyer) {
        var foundUsers;
        const acceptedOrders = await acceptedOrder.find({ buyerid : req.session.userid }).populate([
          { path: "soldDataId", model: "seller_table_data", populate: { path: "userid", model: "seller_user_table"} }
        ]);

        if (req.query.latitude && req.query.longitude && req.query.distance ){
         const lat = req.query.latitude;
         const lon = req.query.longitude;
         const radius = req.query.distance / 6378;

         foundUsers = await sellerData
           .find({
             orderStatus: "active",
             location: {
               $geoWithin: {
                 $centerSphere: [[78.363151, 17.912214], radius],
               },
             },
           })
           .populate([
             {
               path: "userid",
               model: "seller_user_table",
               select: "-soldHistory",
             },
           ]);
       }
        console.log(acceptedOrders)
        return res.render("home", { user: buyer, usersFound: foundUsers, acceptedOrders})
      }

    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
});


//profile
app.get("/profile",redirectLogin,async (req,res) => {
  try {
   
      const seller = await sellerUser.findById({ _id: req.session.userid })
        .populate({ path: "soldHistory", model: "seller_table_data" })
      if (seller) {
        return res.render("profile", { user : seller})
      }

      const buyer = await Buyer.findById({ _id: req.session.userid })
        .populate([
          { path: "acceptedOreders", model: "seller_table_data", populate: { path: "userid", model: "seller_user_table"}},
          { path: "completedOrders", model: "seller_table_data" }
        ])
      if (buyer) {
        // console.log(buyer)
        return res.render("profile", { user: buyer })
      }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

//update profile details
app.post("/updateprofile", async(req,res) => {
  try {
    
    if (req.body.usertype == 'buyer'){
      
        const updateBuyer = await Buyer.findByIdAndUpdate({ _id: req.session.userid } , req.body , { new : true , runValidators : true })
        res.redirect("/profile")
        // return res.status(200).json({ success : true , message : "details updated success"})
      }else if(req.body.usertype == 'seller'){
         const updateBuyer = await sellerUser.findByIdAndUpdate({ _id: req.session.userid } , req.body , { new : true , runValidators : true })
         res.redirect("/profile")
        // return res.status(200).json({ success : true , message : "details updated success"})
      }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

//status change to ongoing (buyer)
app.post("/acceptOrder",async (req,res) => {
  try {
      //  console.log(req.body)
          const usertype = await Buyer.findById({ _id : req.session.userid })

          if(usertype.usertype === "buyer"){
            const buyerData = await acceptedOrder.create(req.body)
            const usersellerDate = await sellerData.findByIdAndUpdate({ _id: req.body.soldDataId }, { orderStatus: "ongoing" }, { new: true, runValidators: true })
          }else{
            return res.status(400).json({ success: false, Erorr: "You are not Authorized to update details" })
          }

      //  return res.status(200).json({ success : true , message : "Order accepted"})
    res.redirect("/?latitude=1&longitude=7&distance=100")

  } catch (error) {
    res.status(500).json({ success : false , error : error.message })
  }
})



//status change to completed order(buyer)
app.post("/rejectOrder", async (req, res) => {
  try {
    const usertype = await Buyer.findById({ _id: req.session.userid })

    if (usertype.usertype === "buyer") {
      const pullSellerData = await acceptedOrder.findByIdAndDelete({ _id: req.body.acceptedOrderId })
      const usersellerData = await sellerData.findByIdAndUpdate({ _id: req.body.sellerdataId }, { orderStatus: "active" }, { new: true, runValidators: true })
    } else {
      return res.status(400).json({ success: false, Erorr: "You are not Authorized to update details" })
    }

    // return res.status(200).json({ success: true, message: "Order completed" })
    res.redirect("/?latitude=1&longitude=7&distance=100")
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

//status change to completed order(buyer)
app.post("/completeOrder", async (req,res) => {
  try {
        const usertype = await Buyer.findById({ _id: req.session.userid })

        if (usertype.usertype === "buyer") {
          const acceptTable = await acceptedOrder.findByIdAndDelete({ _id: req.body.acceptedOrderId })
          const pushSellerData = await Buyer.findByIdAndUpdate({ _id: req.session.userid }, { $push: { "completedOrders": req.body.sellerdataId } }, { new: true, runValidators: true })
          const usersellerData = await sellerData.findByIdAndUpdate({ _id: req.body.sellerdataId }, { orderStatus: "completed", boughtUser: req.session.userid  }, { new: true, runValidators: true })
        } else {
          return res.status(400).json({ success: false, Erorr: "You are not Authorized to update details" })
        }

        // return res.status(200).json({ success: true, message: "Order completed" })
    res.redirect("/?latitude=1&longitude=7&distance=100")
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

//seller cancel order
app.post("/sellerCancelOrder", async (req,res) => {
  try {
    const aceptedData = await acceptedOrder.findByIdAndDelete({ _id: req.body.acceptedOrderId})
    const usersellerDate = await sellerData.findByIdAndUpdate({ _id: req.body.sellerDataIteamId }, { orderStatus: "active" }, { new: true, runValidators: true })
    res.redirect("/")
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

//logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.redirect("/");
      return;
    }

    res.clearCookie("sid");
    res.redirect("/welcome");
  });
});

module.exports = app;
