const user__helper = require('../helpers/user__helper')
const auth = require('../helpers/user__auth');
let product__helper = require('../helpers/product__helper')
let review__helper = require('../helpers/review___helper');
const { response } = require('express');
const graph__helper = require('../helpers/graph__helpers')
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
exports.admingraph = (req,res)=>{
  let categorySales
  graph__helper.get__total__category__sales().then((totalCategorySales)=>{
    print(totalCategorySales,'dunno whats gonna happen')
    categorySales = totalCategorySales
    var data={}
    var test=[]
    var flag=[]
    var check=[]
    // print(j)
    for(var i = 0; i<categorySales.length;i++){
      flag[i]=categorySales[i].category
      data[categorySales[i].category]=categorySales[i].category
    }
    print(data,'is the data')
    print(flag,'is the flag')
    for(i=0;i<flag.length;i++){
      var num=0
      checkSignal=false
      var lock = flag[i]
      for(var k=0;k<check.length;k++){
        if(check[k]==flag[i]){
          checkSignal=true
        }
      }
     if(!checkSignal){
      for(j = i;j<flag.length;j++){
        if(flag[j]==lock){
          num=num+1
        }
        
        }
       
     }
     test[i]=[flag[i],num]
     check[i]=flag[i]
    }
    print(check,'is the check')
    print(test)
  })
  res.status(200).render('admin/graphs/graphsHome',{admin__sidemenu:true,categorySales})
}
