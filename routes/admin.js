const { response } = require('express');
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const { verify } = require('jsonwebtoken')
// var fileupload = require('express-fileupload')
const admin__helpers = require('../helpers/admin__helpers');
const auth = require('../helpers/auth');
const category__helper = require('../helpers/category__helper');
const product__helper = require('../helpers/product__helper');

router.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });

require('dotenv').config()
var adminname
let admin__msg

/* GET  listing. */
router.get('/',auth.adminCookieJWTAuth,function(req, res) {
  admin__helpers.get__users('get__everything').then((response)=>{
    admin__helpers.get__new__users().then((newUsers)=>{
      res.render('admin/dashboard',{response,adminname,newUsers});
    })
  })
});
  ////////////////////////////////////////////  Admin Profile ////////////////////////////

router.get('/profilePage',(req,res)=>{
  admin__helpers.get__admin__action().then((actions)=>{
    res.render('admin/profilePage',{title:'adminProfile',actions,admin__msg})
    admin__msg =''
  })
  
})

router.get('/login',auth.adminLoggedIn,function(req,res){
  console.log('got this far')
  res.render('admin/login');
})
router.post('/login',(req,res)=>{
  console.log('got inside the post')
  console.log(req.body);
  adminname = req.body.name
  admin__helpers.admin__login(req.body).then((response)=>{
    if(response){
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
      res.render('admin/login')
    }
  })
})
router.get('/signup',(req,res)=>{
  res.render('admin/signup');
})
//router for adding another admin
router.get('/addAdmin',(req,res)=>{
  res.render('admin/signup')
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


// route to display all users
router.get('/showUsers',auth.adminCookieJWTAuth,(req,res)=>{
  var a = 'get__all__users'
  console.log('hello')
  //code to get the users data from the database
  admin__helpers.get__users('get__all__users').then((response)=>{
    console.log("And the Admin.js got the data of all users from admin__helpers and now shipping it to the admin webpage")
    res.render('admin/showUsers',{response,adminname})
  })
})
router.get('/showPrimeUsers',auth.adminCookieJWTAuth,(req,res)=>{
  admin__helpers.get__users('get__prime__users').then((response)=>{
    console.log(`now printing all the prime users ${response}`)
    res.render('admin/showPrimeUsers',{response})
  })
})
//route for deleting a user
router.get('/deleteUser/:id',auth.adminCookieJWTAuth,(req,res)=>{
  console.log('got inside the delete router ')
  let uid = req.params.id
  admin__helpers.delete__user(uid).then((response)=>{
    console.log(response)
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
    res.render('admin/show-products',{response,adminname})
  })
})
/// For adding a product ///////////
//////  GET 
router.get('/addProduct',auth.adminCookieJWTAuth,(req,res)=>{
  category__helper.get__category__list().then((data)=>{
  //  console.log(data)
    res.render('admin/add-product',{data})
  })
})
router.post('/addProduct',(req,res)=>{
  console.log('got inside the ppost addproduct')
  product__helper.add__product(req.body).then((data)=>{
    // console.log(req.files);
    let Image = req.files.image
    Image.mv(`public/product-images/${data}.jpg`,(err,done)=>{
      if(!err){
        res.redirect('/admin/addProduct')
      }
    })
    
  })
})

//////////////for deleting a product /////////////////
router.get('/deleteProduct/:id',(req,res)=>{
  let id = req.params.id
 product__helper.delete__product(id).then((response)=>{
  console.log('passed the delete__product function and got inside the get method of delete product')
  res.redirect('/admin/showProducts')
 })
})

router.get('/showCategory',auth.adminCookieJWTAuth,(req,res)=>{
  category__helper.get__category__list().then((data)=>{
    res.render('admin/show-category',{data})
  })
})
router.get('/addCategory',auth.adminCookieJWTAuth,(req,res)=>{
  category__helper.get__category__list().then((data)=>{
    res.render('admin/addCategory',{data})
  })
})
router.post('/addCategory',auth.adminCookieJWTAuth,(req,res)=>{
  console.log('got inside the addcategory post method')
  category__helper.add__category(req.body).then((response)=>{
    res.redirect('/admin/addCategory')
  })
})
///////////// Edit Product route (get) ////////
router.get('/editProduct/:id',auth.adminCookieJWTAuth, async(req,res)=>{
  let id = req.params.id
  console.log('got inside the edit product get method')
 await  product__helper.get__the__product(id).then(async(data)=>{
   await category__helper.get__category__list().then((category)=>{
    console.log(category)
      res.render('admin/editProduct',{data,category})
    })
  })
})

router.post('/editProduct/:id',(req,res)=>{
  let id = req.params.id
  product__helper.update__product(req.params.id,req.body).then(()=>{
    res.redirect('/admin/showProducts')
    if(req.files.image){
      let Image = req.files.image
      Image.mv(`public/product-images/${id}.jpg`)
    }
  })
})
///////////// For deleting a category///////////////////
router.get('/deleteCategory/:id',(req,res)=>{
  category__helper.delete__category(req.params.id).then((response)=>{
    admin__msg = response
    res.redirect('/admin/showCategory')
  })
})

/////////////////////////////////////////// undo user deletion  ///////////////////////////////////////
router.get('/undoUserDeletion/:id',async(req,res)=>{
  admin__helpers.undo__user__deletion(req.params.id).then((response)=>{
    admin__msg = response
    res.redirect('/admin/profilePage')
  })
})


///////Logout Route for the admin/////////
router.get('/logout',(req,res)=>{
  console.log('admin logout attempt detected!!')
  res.clearCookie('admintoken')
  res.render('admin/login')
})
module.exports = router;