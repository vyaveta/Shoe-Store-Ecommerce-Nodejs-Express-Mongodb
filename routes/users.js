var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const user__helper = require('../helpers/user__helper')
const auth = require('../helpers/user__auth');
// const { token } = require('morgan');
let token
let error__msg

//twilio
// const client = require('twilio')(accountSid,authtoken)
const product__helper = require('../helpers/product__helper');
require('dotenv')

let useremail
let username

/* GET users listing. */
router.get('/',function(req, res, next) {
  console.log(req.body)
   token = req.cookies.usertoken
   product__helper.get__top__picks().then((products)=>{
    console.log(products)
    product__helper.get__new__arrivals().then((new__products)=>{
      // product__helper.get__top__picked__products().then((new__products)=>{
        console.log(`the user name that is going to be displayed in the top of the website header is ${username}`)
        res.render('home1',{token,username,products,new__products})
      // })
    })
   })
    
 
});
router.get('/login',auth.userLoggedIn,(req,res)=>{
  console.log('signup button clicked over over!')
  // res.send('you can signup here')
  res.render('login',{error__msg,no__partials:true})
  error__msg = ''
})
/////////////////////////////////////////// USER LOGIN  ////////////////////////////////////////////////////////////////////
router.post('/login',(req,res)=>{
  console.log(req.body)
  user__helper.user__login(req.body).then((response)=>{
    console.log(response)
    if(response=='user__blocked'){
      res.render('blocked')
    }
    else if(response){
      const usertoken = jwt.sign(req.body,process.env.USER_TOKEN_SECRET,{expiresIn:'365d'})
      res.cookie('usertoken',usertoken,{
        httpOnly:true
      })
      const token = usertoken
      console.log('user has logged in ');
      // res.redirect('/users');
        user__helper.get__user__name(req.body.email).then((name)=>{

          product__helper.get__top__picks().then((products)=>{
            console.log(products)
            product__helper.get__new__arrivals().then((new__products)=>{
              username = name
                console.log(`the user name that is going to be displayed in the top of the website header is ${username}`)
                res.render('home1',{token,username,products,new__products})
            })
           })
        })
    }
    else{
      error__msg = 'invalid email or password'
      console.log('login__failed');
      res.redirect('/users/login')
      // res.render('login',{error__msg})
     
    }
  })
  
})
router.get('/signup',(req,res)=>{
  console.log('signup button clicked!! over over!!!');
  res.render('signup',{error__msg,no__partials:true});
  error__msg=''
})
router.post('/signup',(req,res)=>{
 console.log('User signup action detected')
 console.log(req.body)
  user__helper.add__user(req.body).then((response)=>{
    if (response=='deleted by admin'){
      res.render('blocked',{no__partials:true})
    }
   else if(response) {
      const usertoken = jwt.sign(req.body,process.env.USER_TOKEN_SECRET,{expiresIn:'365d'})
      res.cookie('usertoken',usertoken,{
        httpOnly:true
      })
      
        username = req.body.name
      res.redirect('/users')
      // res.render('home1')
      console.log('signup completed');
    }
    else{
      error__msg ='Account already Exists'
      res.redirect('/users/signup')
    }
  })
})


////////////////// Product Page ///////////
router.get('/productPage/:id',(req,res)=>{
  token = req.cookies.usertoken
  console.log(req.params.id)
  var id = req.params.id
  product__helper.get__the__product(id).then((data)=>{
   data.total__clicks++
   console.log(data.total__clicks)
    res.render('users/productPage',{data,token,username})
  })
})



router.get('/login__with__otp',(req,res)=>{
  console.log('got it')
  res.render('users/otpLogin',{no__partials:true})
})
router.post('/otp',(req,res)=>{
  // console.log('get jfsa;d')
  phone__number = req.body.phone__number;
  client.verify
  .services(process.env.TWILIO_SERVICE_ID)
  .verifications.create({
    to:`+91${req.body.phone__number}`,
    channel:'sms'
  })
 
  res.render('users/otp',{no__partials:true})
})
router.post('/user__otp',(req,res)=>{
  const otp = req.body.otp
  console.log('otp ',otp)
  client.verify
  .services(process.env.TWILIO_SERVICE_ID)
  .verificationChecks.create({
    to: `+91${phone__number}`,
    code:otp
  }).then((response)=>{
    console.log(response)
   if(response.valid){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
 user__helper.find__the__user(phone__number).then((response)=>{
  if(response=='blocked'){
    res.render('blocked',{no__partials:true})
  }
  else if(response){
    username = response
    const usertoken = jwt.sign(req.body,process.env.USER_TOKEN_SECRET,{expiresIn:'365d'})
    res.cookie('usertoken',usertoken,{
      httpOnly:true
    })
    const token = usertoken
    console.log('user has logged in ');
    // res.redirect('/users');
    product__helper.get__all__products().then((products)=>{
      // for(var i = 0;i<response.length;i++){
      //   response[i]._id= response[i]._id.toString()
      // }
      res.redirect('/users')
      // res.render('home1',{token,username,products})

    })   
  }
 })
   }
  })
})


// logout///
router.get('/logout',(req,res)=>{
  res.clearCookie('usertoken')
  res.render('login',{no__partials:true})
})

module.exports = router;
