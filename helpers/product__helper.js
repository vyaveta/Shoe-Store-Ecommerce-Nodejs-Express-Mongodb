const db = require('../config/connection')
const collection__list = require('../config/collection')
const { response } = require('express')
const collection = require('../config/collection')
const { resolve, reject } = require('promise')
const objectId = require('mongodb').ObjectId
const print = console.log
const table = console.table

module.exports={
    add__product:(product__details)=>{
        return new Promise( async (resolve,reject)=>{
            table(product__details);
            var category__id = await  db.get().collection(collection__list.CATEGORY__COLLECTIONS).findOne({name:pDetails.category},{_id:1})
            product__details.price = product__details.price * 1
            product__details.stock = product__details.stock * 1
            product__details.total__clicks = 0
            product__details.category = category__id
            await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).insertOne(product__details).then((data)=>{
            //    
                    // console.log('product added')
                    console.log(data)
                    // resolve(data.insertedId)
                    resolve([data.insertedId,`successfuly added ${product__details.company__name} ${product__details.model} to Shoe Store Site`])
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
        return new Promise (async(resolve,reject)=>{
            console.log('got inside the delete__product promise')
             await  db.get().collection(collection__list.PRODUCTS__COLLECTIONS).findOneAndDelete({_id:objectId(id)}).then((product)=>{
                if(response){
                    console.log(' a product', response)
                    // var user__name = deleted__user__details.name
                    resolve(`Successfully deleted ${product.value.company__name} ${product.value.model}`)
                }
                else{
                    console.log('error occured in delete__user')
                }
            })
        })
    },get__the__product:(id)=>{
        return new Promise (async(resolve,reject)=>{
            console.log('got inside the get__prpoducts')
            var product = await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).findOne({_id:objectId(id)})
            db.get().collection(collection__list.PRODUCTS__COLLECTIONS).updateOne({_id:objectId(id)},{$inc:{total__clicks:1}})
            resolve(product)
        })
    },update__product:(pId,pDetails)=>{
        return new Promise(async(resolve,reject)=>{
             var category__id = await  db.get().collection(collection__list.CATEGORY__COLLECTIONS).findOne({name:pDetails.category},{_id:1})
            print(category__id,"is the id of  category something something")

            db.get().collection(collection__list.PRODUCTS__COLLECTIONS).updateOne({_id:objectId(pId)},{$set:{
                company__name:pDetails.company__name,
                model:pDetails.model,
                price:pDetails.price * 1,
                category:category__id,
                description:pDetails.description,
                stock:pDetails.stock * 1
            }}).then((response)=>{
                resolve(`Successfuly updated ${pDetails.company__name} ${pDetails.model}`)
            })
        })
    },get__new__arrivals:()=>{
        return new Promise(async(resolve,reject)=>{
            let new__products = await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).find({stock: {$gt:0}}).sort({$natural:-1}).limit(10).toArray()
            resolve(new__products)
        })
    },get__top__picks:()=>{
        return new Promise(async(resolve,reject)=>{
            let top__picks = await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).find({stock: {$gt:0}}).sort({total__clicks:-1}).limit(10).toArray()
            resolve(top__picks)
        })
    },add__to__cart:(product__id,user__id,user__email)=>{
        let proObj = {
            item:objectId(product__id),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let user__cart = await db.get().collection(collection__list.CART__COLLECTIONS).findOne({user__email:user__email})
            if(user__cart){
                console.log(user__cart,'is the user cart!')
                let proExists = user__cart.products.findIndex(product=> product.item==product__id)
                console.log(proExists)
                if(proExists!=-1){
                    db.get().collection(collection__list.CART__COLLECTIONS)
                    .updateOne({user__email:user__email,'products.item':objectId(product__id)},
                        {
                            $inc:{'products.$.quantity':1},
                            
                        }  
                    ).then(()=>{
                        resolve()
                    })
                }else{
                db.get().collection(collection__list.CART__COLLECTIONS).updateOne({user:objectId(user__id)},
                {
                        $push:{products:proObj}
                }).then((response)=>{
                    resolve('successfully added to cart')
                })
            }
            }else{
                cart = {
                    user:objectId(user__id),
                    user__email:user__email,
                    products:[proObj]
                }
                await db.get().collection(collection__list.CART__COLLECTIONS).insertOne(cart).then((response)=>{
                    resolve('successfully added to cart')
                })
            }
        })
    },get__cart__count: (Uemail)=>{
        return new Promise(async(resolve,reject)=>{
            let cart__count= await db.get().collection(collection__list.CART__COLLECTIONS).aggregate([{$match:{user__email:Uemail}},{$project: { count: { $size:"$products" }}}]).toArray()
                print(cart__count,'is the shipped cart count!!!!!!!!!!!!!!!!')
            if(cart__count == ''){
                print('0')
                resolve(0)
            }
                else if(cart__count[0].count){
                  resolve(cart__count[0].count)
                }
                else{
                  resolve(0) 
                }
        })  
    },find__the__user__cart:(Uemail)=>{
       try{
        return new Promise (async(resolve,reject)=>{
            let user__cart = await db.get().collection(collection__list.CART__COLLECTIONS).aggregate([
                {
                    $match:{user__email:Uemail}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection__list.PRODUCTS__COLLECTIONS,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            console.table(user__cart)
            if(!user__cart || user__cart==null || user__cart==''){

                resolve('no__cart')
            }
            
            resolve(user__cart)
            
        })
       }catch(err){
        console.log('an error occoured in find user cart promise',err)
        resolve('no__cart')
       }
    }
}