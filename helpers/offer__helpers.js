const db = require('../config/connection')
const collection__list = require('../config/collection')
const { response } = require('express')
const { resolve, reject } = require('promise')
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