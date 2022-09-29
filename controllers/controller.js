const user__helper = require('../helpers/user__helper')
const auth = require('../helpers/user__auth');
let product__helper = require('../helpers/product__helper')
let review__helper = require('../helpers/review___helper');
const { response } = require('express');
let user__details
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
  user__details = auth.get__user__details()
  print(req.query)
  review__helper.add__review(user__details,req.query).then((response)=>{
    print(response,'is the response form the promise')
    if(response == 'done'){
      console.log('working')
      res.json('done and working')
    }
  })
}
