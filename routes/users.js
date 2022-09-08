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
  
  
   product__helper.get__all__products().then((products)=>{
    console.log(`the user name that is going to be displayed in the top of the website header is ${username}`)
    res.render('home1',{token,username,products})
   })
    
 
});
router.get('/login',auth.userLoggedIn,(req,res)=>{
  console.log('signup button clicked over over!')
  // res.send('you can signup here')
  res.render('login',{error__msg})
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
      product__helper.get__all__products().then((products)=>{
        user__helper.get__user__name(req.body.email).then((name)=>{
          console.log(name,'is the name')
          username = name
          res.render('home1',{token,username,products})
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
  res.render('signup',{error__msg});
  error__msg=''
})
router.post('/signup',(req,res)=>{
 console.log('User signup action detected')
 console.log(req.body)
  user__helper.add__user(req.body).then((response)=>{
    if (response=='deleted by admin'){
      res.render('blocked')
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
    console.log('the token is  ',token)
    res.render('users/productPage',{data,token,username})
  })
})
// logout///
router.get('/logout',(req,res)=>{
  res.clearCookie('usertoken')
  res.render('login')
})

module.exports = router;
