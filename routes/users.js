var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const user__helper = require('../helpers/user__helper')
const auth = require('../helpers/user__auth');
// const { token } = require('morgan');
const review__helper = require('../helpers/review___helper')
const paypal = require('paypal-rest-sdk');
require('dotenv').config()
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.client_id,
  'client_secret': process.env.client_secret
});

const print = console.log
const table = console.table
let token
let error__msg
let number
var cart__count

let user__details
let total__price
let order__id
//twilio
// const client = require('twilio')(accountSid,authtoken)
const product__helper = require('../helpers/product__helper');
const controller = require('../controllers/controller')
const { response } = require('express');
const { sign } = require('crypto');

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID ,process.env.TWILIO_AUTH_TOKEN)

let useremail = null
let username


/* GET users listing. */
router.get('/',async(req, res, next) => {
  let cart__count
   token = req.cookies.usertoken
   var user__details = auth.get__user__details(req)
   product__helper.get__top__picks().then((products)=>{
    product__helper.get__new__arrivals().then(async(new__products)=>{
    if(user__details){
      await product__helper.get__cart__count(user__details.email).then((count)=>{
         cart__count = count
      })
    }
    try{
      for(var i = 0; i<products.length; i++){
        products[i].loop=[]
        if(products[i].average__rating){
          var R = products[i].average__rating
          for(var j = 0;j<R;j++){
            products[i].loop[j]='star'
          }
        }
      }
      for(var i = 0; i<new__products.length; i++){
        new__products[i].loop=[]
        if(new__products[i].average__rating){
          var R = new__products[i].average__rating
          for(var j = 0;j<R;j++){
            new__products[i].loop[j]='star'
          }
        }
      }
    }catch(err){
      print(err,'is the error that occured in the / router')
    }finally{
      print(products,'is the final result')
      print(`the user name that is going to be displayed in the top of the website header is ${username}`)
     
        res.render('home1',{token,username,products,new__products,cart__count,user__details,user__footer:true})
    }  
   
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
                // res.render('home1',{token,username,products,new__products,cart__count})
                res.redirect('/users')
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
 if(req.body.referal!=''){
  user__helper.referal(req.body.referal).then((result) => {
    console.log(result)
  }).catch((err)=>print(err))
 }
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
router.get('/productPage/:id',async(req,res)=>{
  var user__details = auth.get__user__details(req)
  token = req.cookies.usertoken
  console.log(req.params.id)
  var id = req.params.id
  await product__helper.get__the__product(id).then(async(data)=>{
 if(user__details){
  await product__helper.get__cart__count(user__details.email).then(async(count)=>{
    cart__count = count
  })
 }
    var rec__products = await product__helper.get__rec__products(data.category)
await review__helper.get__productreviews(id).then((reviews)=>{
  // console.log(reviews,'got it hurray aslfkjlkasjf')
  for(var i = 0; i<rec__products.length; i++){
    if(rec__products[i].name==data.name&&rec__products[i].company__name==data.company__name){
      console.log('same detected')
      rec__products.splice(i,1)
    }else{
      rec__products[i].loop=[]
      if(rec__products[i].average__rating){
        var R = rec__products[i].average__rating
        for(var j = 0;j<R;j++){
          rec__products[i].loop[j]='star'
        }
      }
    }
   
  }
  for(var i = 0; i < reviews.length; i++){
    reviews[i].loop =[]
    let R = reviews[i].rating
    for(var j = 0; j < R ;j++){
      reviews[i].loop[j] = 'star'
    }
  }
  // console.log(reviews,'is the end result')
  
  res.render('users/productPage',{data,token,username,cart__count,reviews,user__details,rec__products,user__footer:true})
})

}).catch((err) => {
  // res.send(err)
  res.redirect('/error product not found')
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
    username = response.name
    const usertoken = jwt.sign(response,process.env.USER_TOKEN_SECRET,{expiresIn:'365d'})
    res.cookie('usertoken',usertoken,{
      httpOnly:true
    })
     token = usertoken
    console.log('user has logged in ');
      res.redirect('/users')
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
  print(req.query.product__id,'is the product that is going to be added to cart')
   user__details = auth.get__user__details(req)
  if(user__details==null){
    print('user__Details is null')
    res.redirect('/users/login')
  }else
  // print(user__details,'success')
  product__helper.add__to__cart(req.query.product__id,user__details._id,user__details.email).then((response)=>{
    product__helper.get__cart__count(user__details.email).then((count)=>{
      cart__count = count
      res.json({status:true,count})
   })
  })  
})
router.get('/cart__page',auth.usercookieJWTAuth,async(req,res)=>{
  token = req.cookies.usertoken
   user__details = auth.get__user__details(req)
  table(user__details)
  let total = await user__helper.get__total__amount(user__details)
 let cart__details = await product__helper.find__the__user__cart(user__details.email)
 var real__total =0

print(total,'is the real total')
   product__helper.get__cart__count(user__details.email).then((count)=>{
        cart__count = count
        res.render('users/cartPage',{cart__details,token,username,cart__count,total,user__details})
     })
})
router.post('/changeProductQuantity',async(req,res,next)=>{
  print('got inside the change product quantity router !')
  console.log(req.body)
 try{
  var user__details = auth.get__user__details(req)
 await user__helper.change__product__quantity(req.body).then(async(response)=>{
  await  product__helper.get__cart__count(user__details.email).then(async(count)=>{
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
 var  user__detail =  auth.get__user__details(req)
  var user__details = await user__helper.get__user__details(user__detail._id)
 let response = await product__helper.find__the__user__cart(user__detail.email)
    let total = await user__helper.get__total__amount(user__detail)
    let result = await user__helper.get__user__address(user__detail.email)
    let address = result.address
    console.log(address,'is the address that we got in the get checkout router')
    if(response=='no__cart'){
      res.redirect('/users')
    }
    else
    total.disTotal = req.query.totalPrice
    console.log(user__details._id,'is the user id ')
    res.render('users/addressPage',{token,username,cart__count,total,user__details,address})
})

////////////////////////// some code for showing the user profile page //////////////////////
router.get('/profilePage',auth.usercookieJWTAuth,async(req,res)=>{
   var user__detail =  auth.get__user__details(req)
   var user__details = await user__helper.get__user__details(user__detail._id)
   print(user__details)
   user__helper.get__user__address(user__detail.email).then(async(addresses)=>{
    // print(addresses.address, 'is the address')
    let address = addresses.address
    var cart__count = await product__helper.get__cart__count(user__details.email)
    res.render('users/userProfile',{token,username,cart__count,user__details,address})
  })
})
///////////////////////////////////////////// order placing /////////////////////////////////////////////////
router.post('/placeOrder',async(req,res)=>{
  try{

    console.log('got inside the post method of router')
    user__details = auth.get__user__details(req)
    let order__details = req.body
    order__details.name = user__details.name
    let products = await user__helper.get__cart__products(user__details._id)
    if(products=='no'){
      res.redirect('/')
    }else{
      total__price = await user__helper.get__total__amount(user__details)
   user__helper.place__order(order__details,products,req.query.totalprice).then((orderId)=>{
    order__id = orderId
    if(req.body['payment-method']=='COD'){
      res.json({codSuccess:true})
    }
    else if(req.body['payment-method']=='razorpay'){
      console.log('now in executing the else case i.e the online payment case above the generate razorpay function call')
      user__helper.generateRazorpay(orderId,req.query.totalprice).then((response)=>{
        let signal = {}
        signal.order = response
        signal.flag = 'razorpay'
        res.json(signal)
      })
    }
    else if(req.body['payment-method']=='wallet'){
      user__helper.wallet__payment(user__details._id,req.query.totalprice).then((result) => {
        res.json(result)
      }).catch((err) => {
        res.json(err)
      })
    }
    else{
      console.log('above the paypal function call')
      user__helper.paypal(req.query.totalprice,orderId).then((payment)=>{
        console.log('gonna send the payment to the ajax')
        let signal ={}
        signal.flag = 'paypal'
        signal.order = payment
        console.log(signal)
        payment.flag = "paypal"
      res.json(payment)
      }).catch((err)=>{
        console.log(err,'is the error that happended while integrating paypal payment')
      })
    }
   })
    console.log(req.body)
    } 
  }catch(err){
    res.redirect('/users')
    print(err,'is the error that occured in the user.js placeOrder post router')
  }
})
//////////////////////////////////////////// FOR VIEWING ORDERS //////////////////////////////////////////////////
router.get('/showOrders',auth.usercookieJWTAuth,async(req,res)=>{
  try{
    user__details = await auth.get__user__details(req)
    print(user__details)
  let orders = await user__helper.get__user__orders(user__details._id)
  await product__helper.get__cart__count(user__details.email).then((cart__count)=>{
    print(orders)
    res.render('users/viewOrders',{user__details,orders,token,username,cart__count})
  })
  }catch(err){
    console.log(err)
    res.redirect('/users')
  }
 })
 ///////////////////////////////////////////  FOR VIEWING ORDERED PRODUCTS  //////////////////////////////////////////////
 router.get('/view__ordered__products/',auth.usercookieJWTAuth,async(req,res)=>{
  print(req.query.proId)
  let review__access
  user__details =  await auth.get__user__details(req)
  let order = await user__helper.get__user__orders(user__details._id)
  user__helper.get__ordered__products(req.query.proId,req.query.flag).then(async(order__details)=>{
    console.log(order__details,'is the order details')
  review__access = false
  var view__ordered__products = order__details[0]._id
  await product__helper.get__cart__count(user__details.email).then((cart__count)=>{
    res.render('users/cartPage',{view__ordered__products,order__details,token,user__details,cart__count})
  })
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
 router.get('/add__to__wishlist/:proId',auth.usercookieJWTAuth,(req,res)=>{
  try{
    print(req.params.proId,'is the product id that we got in add to wishlist router')
    user__details = auth.get__user__details(req)
    print(user__details)
    user__helper.add__to__wishlist(req.params.proId,user__details).then((response)=>{
      res.json({status:true})
    }).catch((err)=>{
      print(err,'err in add to wisglist router')
    })
  }catch(err){
    console.log(err,'is the error that occured in the users.js while executing the code of the add to wishlist router!')
  }
 })

 /////////////// now some code for removing from the wishlist ///////////////
 router.get('/remove__from__wishlist/:proId',auth.usercookieJWTAuth,(req,res)=>{
  try{
    user__details = auth.get__user__details(req)
    user__helper.remove__from__wish(req.params.proId,user__details.email).then((response)=>{
      res.json(response)
    })
  }catch(err){
    console.log(err,'is the error occured in the remove from wish list router')
  }
 })

 //////////////// some code for the wishlist products to display ///////////
 router.get('/showWishlist',auth.usercookieJWTAuth,async(req,res)=>{
  token = req.cookies.usertoken
   user__details = auth.get__user__details(req)
  table(user__details)
 let wish__details = await product__helper.find__the__user__wish(user__details.email)
   product__helper.get__cart__count(user__details.email).then((count)=>{
        cart__count = count
        res.render('users/cartPage',{wish__details,token,user__details,cart__count,wish:true})
     })
})
 //////////////////////////////   now some code for the users to delete their address //////
 router.post('/delete__address',auth.usercookieJWTAuth,(req,res)=>{
  user__details = auth.get__user__details(req)
  user__helper.delete__address(req.body.title,user__details.email).then((response)=>{
    res.json({status:true})
  })
 })

 ////////////////////////////////////// some code for the verify payment  /////////////////////////
 router.post('/verify__payment',(req,res)=>{
  console.log(req.body)
  user__helper.verify__payment(req.body).then(()=>{
    user__helper.change__payment__status(req.body['order[receipt]']).then(()=>{
      console.log("payment success");
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false})
  })
 })
 router.get('/success',(req,res)=>{
  try{
    print('got it pay pal success')
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
   
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": total__price / 80
          }
      }]
    };
   
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          user__helper.change__payment__status(order__id).then((response)=>{
            print('paypal done!')
            res.redirect('/users/orderPlaced')
          })
      }
  });
}catch(err){
    console.log(err ,'is the error that caused in the paypal success route')
}
 })

 router.get('/orderPlaced',(req,res)=>{
  res.render('users/orderPlaced',{no__partials:true})
 })

router.get('/cancel', (req, res) => res.send('Cancelled'))

router.post('/updateProfile/:id',controller.update__user__profile)

router.get('/rateProduct',controller.rate__product)

router.get('/bePrime',controller.bePrime)

router.get('/becommingPrime',controller.becommingPrime)

router.post('/verify__payment__prime',controller.verify__payment__prime)

router.get('/home2/:type',controller.user__home2)

router.get('/apply__coupon',controller.apply__coupon)

router.get('/user__chat',controller.user__chat)

router.patch('/return__product',controller.return__product)

router.patch('/updateProfile',controller.update__profile)

router.get('/get__order__details',controller.get__order__details)

router.post('/users/verify__re__order__payment',controller.verify__re__order__payment)

router.get('/get__user__details',controller.get__user__details)

// logout///
router.get('/logout',(req,res)=>{
  res.clearCookie('usertoken')
  res.render('login',{no__partials:true})
})
module.exports = router;