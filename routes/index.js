var express = require('express');
var router = express.Router();


require('dotenv').config()
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID ,process.env.TWILIO_AUTH_TOKEN)
const jwt = require('jsonwebtoken')

// const auth = require('../helpers/user__auth');
// const table = console.table
// const print = console.log
// let phone__number;
// let username;

const product__helper = require('../helpers/product__helper')
const user__helper = require('../helpers/user__helper')



/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('home1', { title: 'Express',products });
  res.redirect('/users')
});
router.get('/productPage/:id',(req,res)=>{
  console.log(req.params.id)
  var id = req.params.id
  product__helper.get__the__product(id).then((data)=>{
    console.log(data)
    res.render('users/productPage',{data})
  })
})

router.get('/success' , (req,res) => {
  console.log(req.query)
  try{
    console.log(req.query.total__price,'is the total price')
  res.redirect('/users/success?paymentId='+req.query.paymentId+'&token='+req.query.token+'&PayerID='+req.query.PayerID+'&total__price='+req.query.total__price)
  }catch(err){
    console.log(err,' is the error that occued in the paypal success router in the index.js file')
  }
})




module.exports = router;
