const db = require('../config/connection')
const collection__list = require('../config/collection')
const user__helper = require('./user__helper')
const objectId = require('mongodb').ObjectId
const print = console.log
const table = console.table

exports.add__offer__to__category = (category__id,discount)=>{
    print(category__id)
    var offer = discount*1
    return new Promise (async(resolve,reject)=>{
        try{
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
          resolve('Done')
        }catch(err){
          reject('Oops Something went wrong !')
        }
      
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

exports.apply__coupon = (code,user__details) => {
  return new Promise(async(resolve,reject) => {
    try{
      var user = await db.get().collection(collection__list.USER__COLLECTIONS).findOne({_id:objectId(user__details._id),used__coupons:{$elemMatch:{coupon__name:code}}})
      if(user) reject('Coupon already Used ')
      else{
        var coupon = await db.get().collection(collection__list.COUPONS__COLLECTIONS).findOne({name:code})
        print(coupon ,' is what we got from the apply__coupon function in the offer helper.js')
        if(coupon){
          user__helper.get__total__amount(user__details).then(async(total)=>{
            if(total.disTotal < coupon.min__purchase__amount)  reject(`This coupon is only available for purchase of ₹${coupon.min__purchase__amount} and above`)
            else{
                      let multiplier = Number(Number(100-coupon.discount)/100)
                      let total__amount = multiplier*total.disTotal
              await db.get().collection(collection__list.USER__COLLECTIONS).findOneAndUpdate({_id:objectId(user__details._id)},{
                $push:{
                  used__coupons:{coupon__name:code}
                }
              }).then(async(data) => {
                await db.get().collection(collection__list.CART__COLLECTIONS).updateOne({user:objectId(data.value._id)},{
                  $set:{coupon:coupon.name}
                })
                resolve({msg:'Hurray Coupon Applied!',coupon:coupon,total:total__amount})
              })
            } 
        })
        }else{
          reject('No such Coupon')
        }
      }
    }catch(err){
      print(err,'is the error that occured in the apply__coupon function in the offer helper.js')
      reject(err)
    }
  })
}
exports.remove__coupon = (user__id) => {
  return new Promise (async(resolve,reject) => {
    try{
      await db.get().collection(collection__list.CART__COLLECTIONS).findOneAndUpdate({user:objectId(user__id)},{
        $set:{coupon:false}
      }).then(async(data) => {
        print(data)
        await db.get().collection(collection__list.USER__COLLECTIONS).findOneAndUpdate({_id:objectId(user__id)},{
          $pull:{used__coupons:{coupon__name:data.value.coupon}}
        }).then(async(result) => {
          let total = await user__helper.get__total__amount(result.value)
          print(total,' is where we get NaN ')
          resolve(total.disTotal)
        })
      })
    }catch(err){
      print(err,'is the error that occured in the remove__coupon function in the offer__helper.js')
      reject(err)
    }
  })
}