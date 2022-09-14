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

// router.get('/login__with__otp',(req,res)=>{
//   console.log('got it')
//   res.render('users/otpLogin')
// })
// router.post('/otp',(req,res)=>{
//   // console.log('get jfsa;d')
//   phone__number = req.body.phone__number;
//   client.verify
//   .services(process.env.TWILIO_SERVICE_ID)
//   .verifications.create({
//     to:`+91${req.body.phone__number}`,
//     channel:'sms'
//   })
 
//   res.render('users/otp')
// })
// router.post('/user__otp',(req,res)=>{
//   const otp = req.body.otp
//   console.log('otp ',otp)
//   client.verify
//   .services(process.env.TWILIO_SERVICE_ID)
//   .verificationChecks.create({
//     to: `+91${phone__number}`,
//     code:otp
//   }).then((response)=>{
//     console.log(response)
//    if(response.valid){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
//  user__helper.find__the__user(phone__number).then((response)=>{
//   if(response=='blocked'){
//     res.render('blocked')
//   }
//   else if(response){
//     username = response
//     const usertoken = jwt.sign(req.body,process.env.USER_TOKEN_SECRET,{expiresIn:'365d'})
//     res.cookie('usertoken',usertoken,{
//       httpOnly:true
//     })
//     const token = usertoken
//     console.log('user has logged in ');
//     // res.redirect('/users');
//     product__helper.get__all__products().then((products)=>{
//       // for(var i = 0;i<response.length;i++){
//       //   response[i]._id= response[i]._id.toString()
//       // }
//       res.redirect('/users')
//       // res.render('home1',{token,username,products})

//     })   
//   }
//  })
//    }
//   })
// })

module.exports = router;
