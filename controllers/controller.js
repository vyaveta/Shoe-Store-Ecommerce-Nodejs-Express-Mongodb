const user__helper = require('../helpers/user__helper')
const auth = require('../helpers/user__auth');
const product__helper = require('../helpers/product__helper')
const review__helper = require('../helpers/review___helper');
const graph__helper = require('../helpers/graph__helpers')
const offer__helper = require('../helpers/offer__helpers')
const coupon__helper = require('../helpers/coupon__helpers')
const banner__helper = require('../helpers/banner__helper')
const fs = require('fs');
const { query } = require('express');


const print = console.log

exports.update__user__profile = (req,res)=>{
    try{
        let Image = req.files.image
    Image.mv(`public/userProfile/${req.params.id}.jpg`,(err,done)=>{
      if(!err){
        console.log('success')
        res.redirect('/users/profilePage')
      }
    })
    }catch(err){
        console.log('an error occured in the first ever controller in your project and the error is ',err)
        res.redirect('/admin/profilePage')
    }
}
exports.rate__product= (req,res)=>{
   var user__details = auth.get__user__details(req)
  print(req.query)
  review__helper.add__review(user__details,req.query).then((response)=>{
    print(response,'is the response form the promise')
    if(response == 'done'){
      console.log('working')
      res.json('done and working')
    }
  })
}
exports.admingraph = (req,res)=>{
  res.status(200).render('admin/graphs/graphsHome',{admin__sidemenu:true})
}


exports.all__category__logic = (req,res)=>{
  let categorySales
   graph__helper.get__total__category__sales().then((totalCategorySales)=>{
    print(totalCategorySales,'dunno whats gonna happen')
    categorySales = totalCategorySales
    print('got here')
    res.json(categorySales)
  })
}
exports.firstgraph =(req,res)=>{
  graph__helper.findOrders().then((data)=>{
    res.json(data)
  })
}

exports.bePrime = (req,res) =>{
  var user__detail = auth.get__user__details(req)
  print (user__detail)
  if (user__detail == null ) {
    res.redirect('/users/login')
  }else{
  user__helper.get__user__details(user__detail._id).then((user__details) => {
    print('here')
    res.render('users/bePrime',{user__details})
  }).catch((err) => {
    print(err,'is the err that catched from the promise funtion in the user__helper ! from the bePrime function in the controller js')
    res.render('user/bePrime',{user__detail})
  })
}
}
exports.becommingPrime = (req,res) =>{
  console.log('the user is trying to become a prime member')
  try{
    var user__details = auth.get__user__details(req)
    if(!user__details){
      throw 'not__logged__in'
    }
  user__helper.prime__razorpay(user__details._id,5000).then((order)=>{
    res.json(order)
  })
  }catch(err){
    console.log(err)
    if(err=='not__logged__in'){
      res.json('not__logged__in')
    }
    else{
      res.json('something wrong happened')
    }
  }
}
exports.verify__payment__prime = async(req,res) => {
  var user__details = await auth.get__user__details(req)
 await user__helper.verify__payment__prime(req.body).then(async()=>{
    console.log('passed the verify payment prime')
   await user__helper.user__becomes__prime(user__details._id).then((resp)=>{
      res.json({status:true})
    })
  })
}

exports.add__offer__to__category = async(req,res) =>{
  offer__helper.add__offer__to__category(req.query.category__id,req.query.discount).then((response)=>{
    res.json(response)
  })
}

exports.show__coupons = (req,res)=>{
  coupon__helper.find__all__coupons().then((data)=>{
    res.status(200).render('admin/showCoupons',{admin__sidemenu:true,coupons:true,data})
  }).catch((err)=>{
    print('error occured in the controller.js show__coupons function')
    res.status(500).send(err)
  })
}

exports.add__coupon = (req,res)=>{
 try{
  const obj = JSON.parse(JSON.stringify(req.body));
  print(obj)
  offer__helper.add__coupon(obj).then((response)=>{
    res.json(response)
  }).catch((err)=>{
    print('an error occured in the controller.js add__coupon function ')
    res.json(err)
  })
 }catch(err){
  print(err)
 }
}

exports.delete__coupon = (req,res) => {
  try{
    offer__helper.delete__coupon(req.query.coupon__id).then((response)=>{
      res.json(response)
    }).catch((err)=>{
      res.json(err)
    })
  }catch(err){
    res.json(err)
  }
}

exports.user__home2 = async(req,res) => {
  try{
    var type = req.params.type
    var user__details = auth.get__user__details(req)
    await product__helper.get__all__products(req.params.type).then(async(products)=>{
      var categories = await product__helper.get__category__list()
     var banners = await banner__helper.get__all__banners()
     for(var i = 0 ; i < banners.length ; i++ ){
      banners[i].image__id = banners[i]._id.toString()
    }
        res.render('users/home2',{products,user__details,categories,type,banners})
    })
  }catch(err){
    print(err)
    res.status(500).render('error')
  }
}

exports.apply__coupon = async(req,res) => {
  try{
    var details = {}
    var user__details =  auth.get__user__details(req)
    offer__helper.apply__coupon(req.query.entered__code,user__details._id).then((result) => {
      details.msg = result.msg
      details.status = true
      details.coupon = result.coupon
      res.json(details)
    }).catch((error) => {
      print(error,'from apply coupon in the controller')
      details.status = false
      details.msg = error
      res.json(details)
    })
  }catch(err){
    res.json(err)
  }
}
exports.banner = (req,res) =>{
  try{
    banner__helper.get__all__banners().then((banners)=>{
      for(var i = 0 ; i < banners.length ; i++ ){
        banners[i].image__id = banners[i]._id.toString()
      }
      print(banners ,'is the banners that we got from the get__all__banners function that has been called in the bannr functionsd in the controller.js')
      res.render('admin/banner',{banners,admin__sidemenu:true})
    }).catch((err) => {
      print(err,'is the error occured in the banner function the controller.js')
      res.send(err)
    })
  }catch(err){
    res.send(err)
    print(err,'is the error occured in the banner function in the controller.js')
  }
}
exports.add__banner = (req,res) =>{
  try{
    print('got inside the add banner function')
    print(req.body)
    print(req.files)
    banner__helper.add__banner(req.body).then((result) => {
      var msg = result[1]
      let banner__image = req.files.banner__input
      banner__image.mv(`public/banners/${result[0]}.jpg`)
    }).catch((error) => {
      print(error,'is the error that occured in the add banner function in controller.js')
    })
    res.redirect('/admin/banners')
  }catch(err){
    print(err,'is the error that occured in the add__banner function in the controller.js')
  }
}

exports.delete__banner = (req,res) => {
  try{
    print('got inside the delete banner function in the controller.js and the banner id that we got from the query is ',req.query.banner__id)
    banner__helper.delete__banner(req.query.banner__id).then((result) => {
      // try {
      //   var path = // the path of the image to be deleted
      //   fs.unlinkSync(path)
      // } catch(err) {
      //   console.error(err)
      // }
      res.json(result)
    }).catch((error) => {
      print('catched an error from the promise function that is coded in banner__helper :"from delete banner function in the controller.js"')
      res.json(error)
    })
  }catch(err){
    print(err,'is the error is the error that is occured in the delete__banner function in the controller.js')
  }
}

exports.user__chat = (req,res) => {
  try{
    res.render('users/chat/chat',{no__partials:true})
  }catch(err){
    print(err,'is the error that occured in the user__chat function in the controller.js')
  }
}

exports.return__product = (req,res) => {
  try{
    var user__details = auth.get__user__details(req)
    user__helper.return__product(user__details,req.query.pro__id,req.query.order__id).then((result) => {
      res.json(true)
    }).catch((err)=>{res.json(false)})
  }catch(err){
    res.json(false)
    print(err,'is the error that occured in the return product function in the controller . js')
  }
}

exports.update__profile =async (req,res) => {
  print(req.query)
  try{
    var user__details = await auth.get__user__details(req)
    var updated__Udetails =await user__helper.get__user__details(user__details._id)
    console.log(updated__Udetails,'is the updated user details')
    user__helper.update__user(updated__Udetails,req.query).then((response) => {
      res.json(response)
    }).catch((err) => {
      res.json(err)
      print(err)
    })
  }catch(err){
    res.json(err)
  }
}

exports.get__order__details = (req,res) => {
 try{
  user__helper.get__order__details(req.query.order__id).then((result) => {
    res.json(result)
  }).catch((err)=>print(err))
 }catch(err){
  res.json(false)
  print(err,'is the error occuren in the get__order__details function in the controller.js')
 }
}

exports.verify__re__order__payment = (req,res) => {
  try{
    
  }catch(err){
    print(err,'is the error occured in the verify__re__order__payment function in the controller.js')
  }
}

exports.get__user__details = async (req,res) => {
  try{
    
    var user = auth.get__user__details(req)
   var user__details = await user__helper.get__user__details(user._id)
   res.json(user__details)
  }catch(err){
    res.json(false)
    print(err,'is the error that occured in the get__user__details function in the controller.js')
  }
}