const { response } = require('express');
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const { verify } = require('jsonwebtoken')
// var fileupload = require('express-fileupload')
const admin__helpers = require('../helpers/admin__helpers');
const auth = require('../helpers/auth');
const user__auth = require('../helpers/user__auth');
const category__helper = require('../helpers/category__helper');
const product__helper = require('../helpers/product__helper');
const user__helper = require('../helpers/user__helper')
const objectId = require('mongodb').ObjectId
const path = require('path')
const graph__helper = require('../helpers/graph__helpers')
const table = console.table
const print = console.log
const controller = require('../controllers/controller')

require('dotenv').config()

router.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });




var adminname
let admin__msg
let admin__details

/* GET  listing. */
router.get('/',auth.adminCookieJWTAuth,function(req, res) {
  admin__helpers.get__users('get__everything').then((response)=>{
    admin__helpers.get__new__users().then((newUsers)=>{
      res.render('admin/dashboard',{response,adminname,newUsers,admin__details,admin__sidemenu:true});
    })
  })
});
  ////////////////////////////////////////////  Admin Profile ////////////////////////////

router.get('/profilePage',(req,res)=>{
  admin__helpers.get__admin__action().then((actions)=>{
    console.log('got the details of the admin ',admin__details)
    res.render('admin/profilePage',{title:'adminProfile',actions,admin__msg,admin__details,no__partials:true})
    admin__msg =''
  })
  
})

router.get('/login',auth.adminLoggedIn,function(req,res){
  console.log('got this far')
res.render('admin/login',{no__partials:true});
})
router.post('/login',(req,res)=>{
  console.log('got inside the post')
  console.log(req.body);
  adminname = req.body.name
  admin__helpers.admin__login(req.body).then((response)=>{
    if(response){
      admin__details = response
      // console.log('login success -- from admin post router')
      // res.render('admin/dashboard')
      const admintoken = jwt.sign(req.body,process.env.ADMIN_TOKEN_SECRET,{expiresIn:'12d'})
      res.cookie('admintoken',admintoken,{
        httpOnly:true
      })
      console.log('login success')
      res.redirect('/admin')
    }
    else{
      console.log('login fail - from admin post router')
      res.render('admin/login',{no__partials:true})
    }
  })
})
router.get('/signup',(req,res)=>{
  res.render('admin/signup',{no__partials:true});
})
//router for adding another admin
router.get('/addAdmin',(req,res)=>{
  res.render('admin/signup',{no__partials:true})
})
router.post('/addAdmin',(req,res)=>{
  console.log(req.body)
admin__helpers.add__admin(req.body).then((response)=>{
  if(response){
    //code for the JWT token creation whatever it is 
    console.log('the admin has succesfully added to the database! ')
    res.redirect('/')
  }
  else{
    console.log('admin login paali')
  }
})
})

router.use(auth.adminCookieJWTAuth)
// route to display all users
router.get('/showUsers',auth.adminCookieJWTAuth,(req,res)=>{
  var a = 'get__all__users'
  console.log('hello')
  //code to get the users data from the database
  admin__helpers.get__users('get__all__users').then((response)=>{
    console.log("And the Admin.js got the data of all users from admin__helpers and now shipping it to the admin webpage")
    res.render('admin/showUsers',{response,adminname,customers:true,admin__sidemenu:true,admin__msg,admin__details})
    admin__msg = ''
  })
})
router.get('/showPrimeUsers',auth.adminCookieJWTAuth,(req,res)=>{
  admin__helpers.get__users('get__prime__users').then((response)=>{
    console.log(`now printing all the prime users ${response}`)
    res.render('admin/showPrimeUsers',{response,admin__sidemenu:true,prime__users:true,admin__details})
  })
})
//route for deleting a user
router.get('/deleteUser/:id',auth.adminCookieJWTAuth,(req,res)=>{
  console.log('got inside the delete router ')
  let uid = req.params.id
  admin__helpers.delete__user(uid).then((response)=>{
    admin__msg = response
    res.redirect('/admin/showUsers')
  })
})

//////////////////  for blocking a user//////////////////////
router.get('/blockuser/:id',auth.adminCookieJWTAuth,(req,res)=>{
  let uid = req.params.id
  admin__helpers.block__user(uid).then((response)=>{
    // if(response=='normal__user')
    res.redirect('/admin/showUsers')
    // else 
    // res.redirect('/admin/showPrimeUsers')
  })
  
// for unblocking a user
})
router.get('/unblockuser/:id',auth.adminCookieJWTAuth,(req,res)=>{
  let uid = req.params.id
  admin__helpers.unblock__user(uid).then((response)=>{
    // if(response=='normal__user')
    res.redirect('/admin/showUsers')
    // else res.redirect('/admin/showPrimeUsers')
  })
})
router.get('/blockPrimeUser/:id',auth.adminCookieJWTAuth,(req,res)=>{
  let uid = req.params.id
  admin__helpers.block__user(uid).then((response)=>{
    res.redirect('/admin/showPrimeUsers')
  })
})
//unblocking a prime user
 router.get('/unblockPrimeUser/:id',auth.adminCookieJWTAuth,(req,res)=>{
  let uid = req.params.id
  admin__helpers.unblock__user(uid).then((response)=>{
    res.redirect('/admin/showPrimeUsers')
  })
})
////////////  for showing all the products////////////
router.get('/showProducts',auth.adminCookieJWTAuth,(req,res)=>{
  admin__helpers.get__allproducts().then((response)=>{
    // for(var i = 0;i<response.length;i++){
    //   response[i].image_id= response[i]._id.toString()
    // }
    console.log(response)
    res.render('admin/show-products',{response,adminname,admin__sidemenu:true,product:true,admin__msg,admin__details})
    admin__msg = ''
  })
})
/// For adding a product ///////////
//////  GET 
router.get('/addProduct',auth.adminCookieJWTAuth,(req,res)=>{
  category__helper.get__category__list().then((data)=>{
  //  console.log(data)
    res.render('admin/add-product',{data,no__partials:true,admin__msg,admin__details})
    admin__msg = ''
  })
})
router.post('/addProduct',auth.adminCookieJWTAuth,async(req,res)=>{
  try{
    table(req.body)
  var product = req.body
  
  product__helper.add__product(product).then(async(data)=>{
    admin__msg = data[1]
    console.log(data[0],data[1])
    print(req.files )
      let Image = req.files.image
      let Image2 = req.files.image2
      let Image3 = req.files.image3
      let Image4 = req.files.image4
      Image.mv(`public/product-images/${data[0]}.jpg`,(err,done)=>{
      })
      Image2.mv(`public/product-images/${data[0]}2.jpg`,(err,done)=>{
      })
      Image3.mv(`public/product-images/${data[0]}3.jpg`,(err,done)=>{
      })
      Image4.mv(`public/product-images/${data[0]}4.jpg`,(err,done)=>{
      })
    res.redirect('/admin/addProduct')
  })
  }catch(err){
    print(err)
  }
})

//////////////for deleting a product /////////////////
router.get('/deleteProduct/:id',auth.adminCookieJWTAuth,(req,res)=>{
  let id = req.params.id
 product__helper.delete__product(id).then((response)=>{
  admin__msg = response
  console.log('passed the delete__product function and got inside the get method of delete product')
  res.redirect('/admin/showProducts')
 })
})

router.get('/showCategory',auth.adminCookieJWTAuth,(req,res)=>{
  category__helper.get__category__list().then((data)=>{
    res.render('admin/show-category',{data,adminname,admin__sidemenu:true,category:true,admin__msg,admin__details})
    admin__msg = ''
  })
})
router.get('/addCategory',auth.adminCookieJWTAuth,(req,res)=>{
  category__helper.get__category__list().then((data)=>{
    res.render('admin/addCategory',{data,no__partials:true,admin__msg,admin__details})
    admin__msg = ''
  })
})
router.post('/addCategory',auth.adminCookieJWTAuth,(req,res)=>{
  console.log('got inside the addcategory post method')
  category__helper.add__category(req.body).then((response)=>{
    admin__msg = response
    res.redirect('/admin/addCategory')
  })
})

///////////// For deleting a category///////////////////
router.get('/deleteCategory/:id',auth.adminCookieJWTAuth,(req,res)=>{
  category__helper.delete__category(req.params.id).then((response)=>{
    admin__msg = response
    res.redirect('/admin/showCategory')
  })
})


///////////// Edit Product route (get) ////////
router.get('/editProduct/:id',auth.adminCookieJWTAuth, async(req,res)=>{
  let id = req.params.id
  console.log('got inside the edit product get method')
 await  product__helper.get__the__product(id).then(async(data)=>{
   await category__helper.get__category__list().then((category)=>{
    console.log(category)
    var imgId = data._id.toString()
    // console.log('the id that we got is ',imgId)
      res.render('admin/editProduct',{data,imgId,category,no__partials:true,admin__details})
    })
  })
})

router.post('/editProduct/:id',auth.adminCookieJWTAuth,(req,res)=>{
  let id = req.params.id
  product__helper.update__product(req.params.id,req.body).then((msg)=>{
    admin__msg = msg
    res.redirect('/admin/showProducts')
   try{
    if(req.files.image){
      let Image = req.files.image
      Image.mv(`public/product-images/${id}.jpg`)
    }if (req.files.image2){
      let Image2 = req.files.image2
      Image2.mv(`public/product-images/${id}2.jpg`)
    } if (req.files.image3){
      let Image3 = req.files.image3
      Image3.mv(`public/product-images/${id}3.jpg`)
    } if (req.files.image4){
      let Image4=req.files.image4
        Image4.mv(`public/product-images/${id}4.jpg`)
    }
    else{
     print('no pics ')
    }
   }catch(err){
    print(err)
   }
  })
})
/////////////////////////////////////////// undo user deletion  ///////////////////////////////////////
router.get('/undoUserDeletion/:id',auth.adminCookieJWTAuth,async(req,res)=>{
  admin__helpers.undo__user__deletion(req.params.id).then((response)=>{
    admin__msg = response
    res.redirect('/admin/profilePage')
  })
})
///////////////////////////////////////////////////////  UPDATING THE ADMIN PROFILE /////////////////////////////////// 

router.post('/updateProfile',auth.adminCookieJWTAuth,async(req,res)=>{
  let Image = req.files.image
  if (admin__details){
    Image.mv(`public/adminProfile/${admin__details._id}.jpg`,(err,done)=>{
      if(!err){
        console.log('success')
        res.redirect('/admin/profilePage')
      }
    })
  }else{
    res.redirect('/admin/profilePage')
  }
})
////////////////////////////////////////////////////// for showing users orders//////////////////////////////////
router.get('/showOrders',(req,res)=>{
  admin__helpers.get__all__orders().then((orders)=>{
    res.render('admin/viewOrders',{admin__details,adminname,admin__sidemenu:true,orders:true,orders})
  })
})
///////////////////////////////////////////// for editing the order status /////////////////////////////
router.post('/editOrderStatus/:orderId',(req,res)=>{
  admin__helpers.change__order__status(req.params.orderId,req.body.status).then((response)=>{
    if(response){
      res.redirect('/admin/showOrders')
    }
  }).catch((res)=>{
    print(res)
  })
})


router.get('/graph',controller.admingraph)

router.get('/getCategoryGraph',controller.all__category__logic)

router.get('/getCategorySales',controller.firstgraph)

router.patch('/add__offer__to__category',controller.add__offer__to__category)

router.get('/show__coupons',controller.show__coupons)

router.post('/add__coupon',controller.add__coupon)

router.delete('/delete__coupon',controller.delete__coupon)

router.get('/banners',controller.banner)

router.post('/add__banner',controller.add__banner)

router.delete('/delete__banner',controller.delete__banner)

router.get('/sales__report',controller.sales__report)


///////Logout Route for the admin/////////
router.get('/logout',(req,res)=>{
  console.log('admin logout attempt detected!!')
  res.clearCookie('admintoken')
  res.render('admin/login',{no__partials:true})
})
module.exports = router;