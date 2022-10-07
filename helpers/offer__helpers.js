const db = require('../config/connection')
const collection__list = require('../config/collection')
const { response } = require('express')
const { resolve, reject } = require('promise')
const collection = require('../config/collection')
const objectId = require('mongodb').ObjectId
const print = console.log
const table = console.table

exports.add__offer__to__category = (category__id,discount)=>{
    var category__name
    print(category__id)
    var offer = discount*1
    return new Promise (async(resolve,reject)=>{
        await db.get().collection(collection__list.CATEGORY__COLLECTIONS).findOneAndUpdate({_id:objectId(category__id)},
        {
            $set:{
                offer:offer
            }
        }).then(async(res)=>{
            
          let products = await  db.get().collection(collection__list.PRODUCTS__COLLECTIONS).find({category:res.value.name}).toArray()
          for( var i = 0;i<products.length;i++){
            var disPrice =Number(100-Number(offer))/100
            await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).updateOne({_id:objectId(products[i]._id)},
            {
                $set:{disPrice:products[i].price*disPrice}
            })
          }
        })
      
    })
}
exports.add__coupon = (details) =>{
  return new Promise(async(resolve,reject)=>{
    try{
        details.discount = details.discount * 1
        details.min__purchase__amount = details.min__purchase__amount * 1
        var { name,discount,min__purchase__amount } = details // this is how you should deconstruct an object !note: the variable name must match with the object key names
       var isthere = await db.get().collection(collection__list.COUPONS__COLLECTIONS).findOne({name:name})
       if(!isthere){
        await db.get().collection(collection__list.COUPONS__COLLECTIONS).insertOne(details).then((response)=>{
            if(response.acknowledged){
                resolve('Successfully added the Coupon')
            }else{
                print(response)
                reject('Coupon not Inserted You may try again with different name')
            }
        })
       }else{
        reject('Coupon already exits try adding unique name')
       }
      }catch(err){
        print(err,'is the err occured in the offer__helpers.js while executing the add__coupon function')
        reject('err occured')
      }
  })
}
exports.delete__coupon = (coupon__id) => {
  return new Promise(async(resolve,reject) => {
    try{
      await db.get().collection(collection__list.COUPONS__COLLECTIONS).deleteOne({_id:objectId(coupon__id)}).then((result) => {
        if (result.acknowledged) resolve('Succesfully deleted the Coupon')
        else reject('something went wrong, the coupon isnt deleted')
      })
    }catch(err){
      reject(err)
    }
  })
}