const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
const { resolve, reject } = require('promise');
const { response } = require('express');
const objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const crypto = require('crypto')
const paypal = require('paypal-rest-sdk');
 
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AQFcDqeYJQK2LZ0YbKFrh0r_PAFSShbgK5XTOJ25YxjtAWnq3QpYDNfoDuAHu9EzB-lCVTdUMK3kP3MS',
  'client_secret': 'EB_f8QlJSFuW6zRueNatOW4x6UJC13AjZfFrHeZS6UMwqYbp-cWOuX9OVJVeUGMj6p_5qP7bg0_EHNxZ'
});
var instance = new Razorpay({
    key_id:'rzp_test_BSsgMe3aOTLBnC',
    key_secret:'liUTofbWu4r68kbcSxU51Wmm',
})



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
                        resolve(account);
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
            if(details.count ==-1 && details.quantity ==1 || details.count == 40406660999){
              await  db.get().collection(collection.CART__COLLECTIONS)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            }else{
          await  db.get().collection(collection.CART__COLLECTIONS)
                    .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
                        {
                            $inc:{'products.$.quantity':details.count},
                            
                        }  
                    ).then(()=>{
                        resolve({done:true})
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
            try{
                console.table(total[0].total)
                resolve(total[0].total)
            }catch(err){
                console.table(err)
                resolve(0)
            }
        })
    },
    place__order:(order__details,products,total)=>{
        var today = new Date()
        var dd = String(today.getDate()).padStart('2',0)
        var mm = String(today.getMonth()+1).padStart('2',0)
        var yyyy = today.getFullYear()
        today = mm + '-' + dd + '-' + yyyy
        console.log('got inside the place order promise')
        return new Promise(async(resolve,reject)=>{
            console.log(order__details,products,total)
            let status = order__details['payment-method']=='COD'?'placed':'pending'
            console.log(total, 'is the total')
            console.log(order__details,'is the order details')
            let orderObj = {
                delivery__details:{
                    mobile:order__details.Phone__number,
                    address:order__details.address,
                    pincode:order__details.pincode
                },
                user__id:objectId(order__details.user_id),
                payment__method:order__details['payment-method'],
                products:products,
                total__amount:total,
                status:status,
                date:today
            }
            console.log('before insertion')
            db.get().collection(collection.ORDER__COLLECTION).insertOne(orderObj).then((response)=>{
                console.log('inserted the order to db')
                db.get().collection(collection.CART__COLLECTIONS).deleteOne({user:objectId(order__details.user__id)})
                console.log(response.insertedId)
                resolve(response.insertedId)
            })
        })
    },
    get__cart__products:(user__id)=>{
        return new Promise(async(resolve,reject)=>{
            let cart = await db.get().collection(collection.CART__COLLECTIONS).findOne({user:objectId(user__id)})
            resolve(cart.products)
        })
    },
    get__user__orders:(user__id)=>{
        return new Promise(async(resolve,reject)=>{
            console.log('got inside the get user order promise in the user helper.js')
            let orders = await db.get().collection(collection.ORDER__COLLECTION).find({user__id:objectId(user__id)}).toArray()
            resolve(orders)
        })
    },
    get__ordered__products:(order__id)=>{
        return new Promise(async(resolve,reject)=>{
            let order__products = await db.get().collection(collection.ORDER__COLLECTION).aggregate([
                {
                    $match:{_id:objectId(order__id)}
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
                        as:'products'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
                    }
                }
            ]).toArray()
            console.log('passed the get__ordered__products aggregation')
            resolve(order__products)
        })
    },
    delete__order:(order__id)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.ORDER__COLLECTION).updateOne({_id:objectId(order__id)},{
                $set:{status:'cancelled',cancelled:true}
            }).then((response)=>{
                console.log(response)
                resolve('done')
            })
        })
    },
    add__address:(user__email,address,address__title,state,pincode,country)=>{
        
        console.log(address__title,"from the add address promise")
        return new Promise (async(resolve,reject)=>{
            await db.get().collection(collection.USER__COLLECTIONS).updateOne({email:user__email},{
                $push:{
                    address:{title:address__title,address:address,state:state,pincode:pincode,country:country}
                }
            })
            resolve('Successfuly added the address')
        })
    },
    get__user__address(user__email){
        return new Promise(async(resolve,reject)=>{
            let addresses = await db.get().collection(collection.USER__COLLECTIONS).aggregate([
                {
                    $match:{email:user__email}
                },
                {
                    $project:{"address":"$address",_id:0}
                }
            ]).toArray()
           if(addresses){
            console.log(addresses[0],'is the ddresdjjsfljfjslf')
            resolve(addresses[0])
           }
           else{
            resolve('no__address')
           }
        })
    },
    delete__address:(title,user__email)=>{
        console.log(user__email,'is the user email')
        console.log(title,'is the title of the address ')
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER__COLLECTIONS).updateOne(
                { 'email': user__email }, 
                { $pull: { address: { title: title } } },
                false, // Upsert
                true, // Multi
            ).then((response)=>{
                console.log(response)
            })
            resolve({success:true})
        })
    },generateRazorpay:(order__id,total)=>{
        var to_pay = total*100
        console.log('got inside the generate generaterazorpay ')
        return new Promise (async(resolve,reject)=>{
          var options = {
            amount:to_pay,
            currency:"INR",
            receipt:""+order__id
          };
          instance.orders.create(options,(err,order)=>{
            if(err){
                console.log(err,'is the error occured in the generate razorpay promise')
            }
            else{
                console.log(order,'is the order that we got from the generate razorpay promise that is in the user helper.js')
                resolve(order)
            }
          })
        })
    },
    verify__payment:(details)=>{
        console.log(details,'msg from the verufy pasfkdjkfj')
        return new Promise (async(resolve,reject)=>{
            let hmac = crypto.createHmac('sha256','liUTofbWu4r68kbcSxU51Wmm')
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if(hmac == details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },
    change__payment__status:(order__id)=>{
        return new Promise(async(resolve,reject)=>{
            console.log('got inside the update payment status and order id is ', order__id)
            db.get().collection(collection.ORDER__COLLECTION).updateOne({_id:objectId(order__id)},
            {
                $set:{
                    status:'placed' 
                }
            }
            ).then((response)=>{
                console.log(response,'from change payment status')
                resolve()
            })
        })
    },
    paypal:(total__amount,order__id)=>{
        console.log('paypal function called!!!')
        var amount = total__amount / 80
        return new Promise((resolve,reject)=>{
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/success",
                    "cancel_url": "http://localhost:3000/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "Red Sox Hat",
                            "sku": "001",
                            "price": amount,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": amount
                    },
                    "description": "Hat for the best team ever"
                }]
            };
             
            paypal.payment.create(create_payment_json, function (error, payment) {
             try{
                if (error) {
                    throw error;
                } else {
                    payment.order__id = order__id
                    console.log('gonna resolve the payment')
                    console.log(payment,'logged from the paypal.payment.create')
                    resolve(payment)
                }
             }catch(err){
                console.log(err,'is the error occured while paypal integration')
             }
            });
             
            });
    },
    add__to__wishlist:(pro__id,user__email,user__id)=>{
        let proObj = {
            item:objectId(pro__id),
        }
        return new Promise (async(resolve,reject)=>{
            try{
                let user__wishlist = await db.get().collection(collection.WISHLIST__COLLECTION).findOne({user__email:user__email})
            if (user__wishlist){
                db.get().collection(collection.WISHLIST__COLLECTION).updateOne({user__email:user__email},
                {
                        $push:{products:proObj}
                }).then((response)=>{
                    resolve('successfully added to wishlist')
                })
            }else{
                wishlist = {
                    user:objectId(user__id),
                    user__email:user__email,
                    products:[proObj]
                }
                await db.get().collection(collection.WISHLIST__COLLECTION).insertOne(wishlist).then((response)=>{
                    resolve('successfully added to wishlist')
                })
            }
            }catch(err){
                reject(err)
                console.log(err,'is the error that occured in the user__helpers.js while executing the add to wishlist function !!')
            }
        })
    }
}