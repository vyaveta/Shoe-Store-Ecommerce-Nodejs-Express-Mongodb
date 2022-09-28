var express = require('express');
var router = express.Router();


require('dotenv').config()
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID ,process.env.TWILIO_AUTH_TOKEN)
const jwt = require('jsonwebtoken')

const auth = require('../helpers/user__auth');
const table = console.table
const print = console.log
let phone__number;
let username;

const product__helper = require('../helpers/product__helper')
const user__helper = require('../helpers/user__helper')



/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('Now rendering the index but wtf is this index')
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

// /success?paymentId=PAYID-MMZ4PWQ56306074WJ268400F&token=EC-62V98980KT175064J&PayerID=6P4NDV2AA95E8
router.get('/success',(req,res)=>{
  const payerId = req.query.PayerID;
  const token = req.query.token
  const paymentId = req.query.paymentId;
  res.redirect('/users/success/?paymentId='+paymentId+'&token='+token+'&PayerID='+payerId)
})


module.exports = router;
