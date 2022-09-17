const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
const { resolve, reject } = require('promise');
const objectId = require('mongodb').ObjectId



module.exports={
    //add__user is double equal to user__sign__up
    add__user:(user)=>{
        return new Promise(async(resolve,reject)=>{
            var success = null
            var is__there = await db.get().collection(collection.USER__COLLECTIONS).findOne({$or:[{email:user.email},{phone__number:user.phone__number}]});
            var is__deleted = await db.get().collection(collection.DELETED__ACCOUNTS).findOne({$or:[{email:user.email},{phone__number:user.phone__number}]})
            var is__admin = await db.get().collection(collection.ADMIN__COLLECTIONS).findOne({$or:[{email:user.email},{phone__number:user.phone__number}]});
            if(is__admin){
                success = false;
                resolve(success);
            }
            else if (is__deleted){
                resolve('deleted by admin')
            }
            else if (!is__there){
                success = true;
                user.password = await bcrypt.hash(user.password,10);
                user.is_member = false
                user.total_purchase = 0
                user.is__blocked = false
                user.address = []
                user.cart = []
                user.wishlist = []
                user.used__coupons = []
                db.get().collection(collection.USER__COLLECTIONS).insertOne(user);
                resolve(success)
            }
            else{
                success = false;
                resolve(success)
            }
        })
    },
    user__login:(user)=>{
        return new Promise(async(resolve,reject)=>{{
            var is__valid = null;
            var account = await db.get().collection(collection.USER__COLLECTIONS).findOne({email:user.email})

            if(!account){
                is__valid = false;
                resolve(is__valid);
            }
            else if(account.is__blocked){
                is__valid = 'user__blocked';
                resolve(is__valid)
                console.log('the user__login says that the user is blocked!!')
            }
            else if(account){
                bcrypt.compare(user.password,account.password).then((status)=>{
                    if(status){
                        is__valid = account;
                        resolve(is__valid);
                    }
                    else{
                        is__valid = false;
                        resolve(is__valid);
                    }
                })
            }
            else{
                is__valid = false;
                resolve(is__valid);
            }
        }})
    },
    get__user__name:(user__email)=>{
        let username
        return new Promise (async(resolve,reject)=>{
            username = await db.get().collection(collection.USER__COLLECTIONS).findOne({email:user__email},{name:1,_id:-1})
            console.table(username)
            resolve(username.name)
        })
    },find__the__user:(phone__number)=>{
        return new Promise (async(resolve,reject)=>{
            var is__valid = null;
            var is__valid = null;
            var account = await db.get().collection(collection.USER__COLLECTIONS).findOne({phone__number:phone__number})
            console.log(account)
            if(!account){
                resolve('no__account')
            }
          else if(account.is__blocked){
                is__valid = 'user__blocked';
                resolve('blocked')
                console.log('the user__login says that the user is blocked!!')
            }
             else if(account){
                        is__valid = account;
                        resolve(is__valid);
                    }
            else{
                is__valid = false;
                resolve(is__valid);
            }
        })
    },
    change__product__quantity:(details)=>{
       details.count = parseInt(details.count)
       details.quantity = parseInt(details.quantity)
        console.log(details.cart,details.product,'and the count is ',details.count)
        return new Promise(async(resolve,reject)=>{
            if(details.count ==-1 && details.quantity ==1){
                db.get().collection(collection.CART__COLLECTIONS)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            }else{
            db.get().collection(collection.CART__COLLECTIONS)
                    .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
                        {
                            $inc:{'products.$.quantity':details.count},
                            
                        }  
                    ).then(()=>{
                        resolve(true)
                    })
                }
        })
    },
    get__total__amount:(user__details)=>{
        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection(collection.CART__COLLECTIONS).aggregate([
                {
                    $match:{user__email:user__details.email}
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
                        from:collection.PRODUCTS__COLLECTIONS,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.price']}}
                    }
                }
            ]).toArray()
            console.table(total[0].total)
            resolve(total[0].total)
        })
    }
}


