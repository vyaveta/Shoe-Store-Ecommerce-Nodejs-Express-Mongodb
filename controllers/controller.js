const user__helper = require('../helpers/user__helper')
const auth = require('../helpers/user__auth');
let product__helper = require('../helpers/product__helper')
let review__helper = require('../helpers/review___helper');
const { response } = require('express');
const graph__helper = require('../helpers/graph__helpers')
const offer__helper = require('../helpers/offer__helpers')
const coupon__helper = require('../helpers/coupon__helpers')

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
  var user__details = auth.get__user__details(req)
  res.render('users/bePrime',{user__details})
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
  print('got it inside the controller ')
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
exports.banner = (req,res) =>{

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
      res.render('users/home2',{products,user__details,categories,type})
    })
  }catch(err){
    print(err)
    res.status(500).render('error')
  }
}