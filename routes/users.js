var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const user__helper = require('../helpers/user__helper')
const auth = require('../helpers/user__auth');
// const { token } = require('morgan');
const print = console.log
const table = console.table
let token
let error__msg
let number
let cart__count
let user__details
//twilio
// const client = require('twilio')(accountSid,authtoken)
const product__helper = require('../helpers/product__helper');
const { response } = require('express');
require('dotenv').config()
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID ,process.env.TWILIO_AUTH_TOKEN)

let useremail = null
let username


/* GET users listing. */
router.get('/',async(req, res, next)=> {
   token = req.cookies.usertoken
   product__helper.get__top__picks().then((products)=>{
    product__helper.get__new__arrivals().then((new__products)=>{
     product__helper.get__cart__count(useremail).then((count)=>{
        cart__count = count
      // product__helper.get__top__picked__products().then((new__products)=>{
      print(`the user name that is going to be displayed in the top of the website header is ${username}`)
        res.render('home1',{token,username,products,new__products,cart__count})
      // })
    })
    })
   })
});
router.get('/login',auth.userLoggedIn,(req,res)=>{
  res.render('login',{error__msg,no__partials:true})
  error__msg = ''
})
/////////////////////////////////////////// USER LOGIN  ////////////////////////////////////////////////////////////////////
router.post('/login',(req,res)=>{
  
  user__helper.user__login(req.body).then((response)=>{
    console.log(response)
    if(response=='user__blocked'){
      res.render('blocked',{no__partials:true})
    }
    else if(response){
      const usertoken = jwt.sign(response,process.env.USER_TOKEN_SECRET,{expiresIn:'365d'})
      res.cookie('usertoken',usertoken,{
        httpOnly:true
      })
     // const token = usertoken
      token = usertoken
      console.log('user has logged in ');
      // res.redirect('/users');
      user__helper.get__user__name(req.body.email).then((name)=>{
          useremail = req.body.email
          product__helper.get__cart__count(useremail).then((count)=>{
            cart__count = count
            product__helper.get__top__picks().then((products)=>{
              product__helper.get__new__arrivals().then((new__products)=>{
                username = name
                console.log(`the user name that is going to be displayed in the top of the website header is ${username}`)
                res.render('home1',{token,username,products,new__products,cart__count})
               })
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
  var name = req.body.name
  console.table(req.body)
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
      
        username = name
        console.warn(username)
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
   
   console.log(data.total__clicks)
   product__helper.get__cart__count(useremail).then((count)=>{
    cart__count = count
    res.render('users/productPage',{data,token,username,cart__count})
  })
})
})



router.get('/login__with__otp',(req,res)=>{
  console.log('got it')
  res.render('users/otpLogin',{no__partials:true,error__msg})
  error__msg=''
})
router.post('/otp',(req,res)=>{
  number = req.body.phone__number
 user__helper.find__the__user(req.body.phone__number).then((response)=>{
  if(response=='no__account'){
    error__msg = 'no account with that phone number'
    res.redirect('/users/login')
  }
  else{
    console.log('get jfsa;d')
     console.log(req.body.phone__number,'is the phone number ')
    client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verifications.create({
      to:`+91${req.body.phone__number}`,
      channel:'sms'
    })
   
    res.render('users/otp',{no__partials:true})
  }
 })
})
router.post('/user__otp',(req,res)=>{
  const otp = req.body.otp
  console.log('otp ',otp)
  client.verify
  .services(process.env.TWILIO_SERVICE_ID)
  .verificationChecks.create({
    to: `+91${number}`,
    code:otp
  }).then((response)=>{
    console.log(response)
   if(response.valid==true){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
 user__helper.find__the__user(number).then((response)=>{
  
  if(response=='blocked'){
    res.render('blocked',{no__partials:true})
  }
  else if(response){
    username = response
    const usertoken = jwt.sign(response,process.env.USER_TOKEN_SECRET,{expiresIn:'365d'})
    res.cookie('usertoken',usertoken,{
      httpOnly:true
    })
    const token = usertoken
    console.log('user has logged in ');
    // res.redirect('/users');
      // for(var i = 0;i<response.length;i++){
      //   response[i]._id= response[i]._id.toString()
      // }
      res.redirect('/users')
      // res.render('home1',{token,username,products})   
  }
 })
   }
   else{
    error__msg ='incorrect otp'
    res.render('users/otp',{error__msg,no__partials:true}) // redirecting is the problem
   }
  })
})
router.get('/otpiloodvaa',(req,res)=>{
  res.render('users/otp',{error__msg})
  error__msg =''
})
router.get('/add__to__cart/',auth.usercookieJWTAuth,(req,res)=>{
  if(token==null){
    res.redirect('/users/login')
  }
  print(req.query.product__id)
  print('got the call from ajax')
   user__details = auth.get__user__details()
  if(user__details==null){
    print('user__Details is null')
  }else
  print(user__details,'success')
  product__helper.add__to__cart(req.query.product__id,user__details._id,user__details.email).then((response)=>{
    product__helper.get__cart__count(useremail).then((count)=>{
      cart__count = count
      res.json({status:true,count})
   })
  })  
})
router.get('/cart__page',auth.usercookieJWTAuth,async(req,res)=>{
  token = req.cookies.usertoken
   user__details = auth.get__user__details()
  table(user__details)
  let total = await user__helper.get__total__amount(user__details)
 let cart__details = await product__helper.find__the__user__cart(user__details.email)

   product__helper.get__cart__count(useremail).then((count)=>{
        cart__count = count
        res.render('users/cartPage',{cart__details,token,username,cart__count,total})
     })
})
router.post('/changeProductQuantity',async(req,res,next)=>{
  print('got inside the change product quantity router !')
  console.log(req.body)
 try{
 await user__helper.change__product__quantity(req.body).then(async(response)=>{
  await  product__helper.get__cart__count(useremail).then(async(count)=>{
      // response.total = await  user__helper.get__total__amount(user__details)
    await  user__helper.get__total__amount(user__details).then(async(total)=>{
        cart__count = count  
        response.count = count
        console.log(response.count,'is the response.count')
        response.total = await total
        console.log(response.total,'is the total amount from the user js router section!!')
        console.log(response)
        res.json(response)  
      })
   })
  })
 }catch(err){
  console.log('error catched in user.js router section in change product quantity ')
  res.redirect('login')
}
})
router.get('/checkout',auth.usercookieJWTAuth,async(req,res)=>{
  user__details = auth.get__user__details()
 let response = await product__helper.find__the__user__cart(user__details.email)
    let total = await user__helper.get__total__amount(user__details)
    let result = await user__helper.get__user__address(user__details.email)
    let address = result.address
    console.log(address,'is the address that we got in the get checkout router')
    if(response=='no__cart'){
      res.redirect('/users')
    }
    else
    res.render('users/addressPage',{token,username,cart__count,total,user__details,address})
})

////////////////////////// some code for showing the user profile page //////////////////////
router.get('/profilePage',auth.usercookieJWTAuth,(req,res)=>{
   user__details = auth.get__user__details()
   user__helper.get__user__address(user__details.email).then((addresses)=>{
    print(addresses.address, 'is the address')
    let address = addresses.address
    res.render('users/userProfile',{token,username,cart__count,user__details,address})
  })
})
///////////////////////////////////////////// order placing /////////////////////////////////////////////////
router.post('/placeOrder',async(req,res)=>{
  console.log('got inside the post method of router')
  user__details = auth.get__user__details()
  let products = await user__helper.get__cart__products(user__details._id)
  let total__price = await user__helper.get__total__amount(user__details)
 user__helper.place__order(req.body,products,total__price).then((response)=>{
  res.json({status:true})

 })
  console.log(req.body)
})
//////////////////////////////////////////// FOR VIEWING ORDERS //////////////////////////////////////////////////
router.get('/showOrders',auth.usercookieJWTAuth,async(req,res)=>{
  try{
    user__details = await auth.get__user__details()
    print(user__details)
  let orders = await user__helper.get__user__orders(user__details._id)
   res.render('users/viewOrders',{user__details,orders,token,username})
  }catch(err){
    console.log(err)
    res.redirect('/users')
  }
 })
 ///////////////////////////////////////////  FOR VIEWING ORDERED PRODUCTS  //////////////////////////////////////////////
 router.get('/view__ordered__products/:id',auth.usercookieJWTAuth,async(req,res)=>{
 user__helper.get__ordered__products(req.params.id).then((order__details)=>{
console.log(order__details)
   res.render('users/cartPage',{view__ordered__products:true,order__details,token,username,cart__count})
 })
 })
 //////////////////////////////////////////////////// for cancelling  orders//////////////////////////////////////////////
 router.get('/deleteOrder/:orderID',auth.usercookieJWTAuth,(req,res)=>{
  console.log('got inside the delete order route',req.params.orderID)
  user__helper.delete__order(req.params.orderID).then((response)=>{
    console.log(response)
    res.redirect('/users/profilePage')
  })
 })

 /////////////////////////////////////////  for users to add address ////////////////////////////
 router.post('/add__address/:user__email',auth.usercookieJWTAuth,(req,res)=>{
 user__helper.add__address(req.params.user__email,req.body.address,req.body.title,req.body.state,req.body.pincode,req.body.country).then((response)=>{
  if(response){
    res.redirect('/users/profilePage')
  }
 })
 })

 ///////////////////////////////////// NOW SOME CODE FOR THE ADD TO WISHLIST  ////////////////////////
 router.post('/add__to__wishlist',auth.usercookieJWTAuth,(req,res)=>{
  try{
    print(req.body)
    user__details = auth.get__user__details()
    print(user__details)
    user__helper.add__to__wishlist(req.body.product,user__details.email).then((response)=>{
      res.json({status:true})
    })
  }catch(err){
    console.log(err,'is the error that occured in the users.js while executing the code of the add to wishlist router!')
  }
 })
 //////////////////////////////   now some code for the users to delete their address //////
 router.post('/delete__address',auth.usercookieJWTAuth,(req,res)=>{
  user__details = auth.get__user__details()
  user__helper.delete__address(req.body.title,user__details.email).then((response)=>{
    res.json({status:true})
  })
 })
// logout///
router.get('/logout',(req,res)=>{
  res.clearCookie('usertoken')
  res.render('login',{no__partials:true})
})
module.exports = router;