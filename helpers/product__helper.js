const db = require('../config/connection')
const collection__list = require('../config/collection')
const objectId = require('mongodb').ObjectId

module.exports={
    add__product:(product__details)=>{
        return new Promise( async (resolve,reject)=>{
            console.log(product__details);
            await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).insertOne(product__details).then((data)=>{
            //    
                    // console.log('product added')
                    console.log(data)
                    resolve(data.insertedId)
                // resolve(data._id)
            })

        })
    },get__all__products:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).find().toArray()
            resolve(products)
        })
    },delete__product:(id)=>{
        console.log(id)
        return new Promise ((resolve,reject)=>{
            console.log('got inside the delete__product promise')
             db.get().collection(collection__list.PRODUCTS__COLLECTIONS).deleteOne({_id:objectId(id)}).then((response)=>{
                if(response){
                    console.log('Deleted a product')
                    // var user__name = deleted__user__details.name
                    resolve('status')
                }
                else{
                    console.log('error occured in delete__user')
                }
            })
        })
    },get__the__product:(id)=>{
        console.log('asjflkjjlj')
        return new Promise (async(resolve,reject)=>{
            console.log('got inside the get__prpoducts')
            var product = await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).findOne({_id:objectId(id)})
            resolve(product)
        })
    },update__product:(pId,pDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection__list.PRODUCTS__COLLECTIONS).updateOne({_id:objectId(pId)},{$set:{
                company__name:pDetails.company__name,
                model:pDetails.model,
                price:pDetails.price,
                category:pDetails.category,
                description:pDetails.description
            }}).then((response)=>{
                resolve()
            })
        })
    }
}