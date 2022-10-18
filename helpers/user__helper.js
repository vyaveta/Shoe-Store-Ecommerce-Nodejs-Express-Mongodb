const db = require('../config/connection');
const collection = require('../config/collection');
const bcrypt = require('bcrypt');
const { resolve, reject } = require('promise');
const { response } = require('express');
const objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const crypto = require('crypto')
const paypal = require('paypal-rest-sdk');
const { stat } = require('fs');
const print = console.log
 
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
    },
    get__user__details:(id) => {
        print('here')
        return new Promise(async(resolve,reject) => {
            try{
                let user = await db.get().collection(collection.USER__COLLECTIONS).findOne({_id:objectId(id)})
                print(user)
                resolve(user)
            }catch(err){
                reject(err)
                print(err,'is the error that occured in the get__user__details function in the user__helper.js')
            }
        })
    },
    find__the__user:(phone__number)=>{
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
                        total:{$sum:{$multiply:['$quantity','$product.price']}},
                        disTotal:{$sum:{$multiply:['$quantity','$product.disPrice']}}
                    }
                }
            ]).toArray()
            try{
                console.log(total,'is the result form the get total price promise, and total[0] is :',total[0])
                console.table(total[0].total)
                if(total[0].disTotal == 0) total[0].disTotal = total[0].total
                resolve(total[0])
            }catch(err){
                console.table(err)
                resolve(0)
            }
        })
    },
    place__order:(order__details,products,total)=>{
        var today = new Date()
        var order__date = new Date()
        var dd = String(today.getDate()).padStart('2',0)
        var mm = String(today.getMonth()+1).padStart('2',0)
        var yyyy = today.getFullYear()
        today = mm + '-' + dd + '-' + yyyy
        console.log('got inside the place order promise')
        return new Promise(async(resolve,reject)=>{
            console.log(order__details,products,total)
            let status = order__details['payment-method']=='COD'?'placed': 'wallet'?'placed' : 'pending' // Here I have to add another condition if payment-method == wallet then status = place
            console.log(total, 'is the total')
            console.log(order__details,'is the order details')
            let orderObj = {
                delivery__details:{
                    mobile:order__details.Phone__number,
                    address:order__details.address,
                    pincode:order__details.pincode,
                    country:order__details.country,
                    state:order__details.state
                },
                user__id:objectId(order__details.user_id),
                user__name:order__details.name,
                payment__method:order__details['payment-method'],
                products:products,
                total__amount:total,
                status:status,
                date:today,
                order__date:order__date,
                country:order__details.country,
                state:order__details.state
            }
            console.log('before insertion')
            db.get().collection(collection.ORDER__COLLECTION).insertOne(orderObj).then((response)=>{
                console.log('inserted the order to db')
                db.get().collection(collection.CART__COLLECTIONS).deleteOne({user:objectId(order__details.user__id)})
                console.log(response.insertedId)
                resolve(response.insertedId)
            })
            await db.get().collection(collection.USER__COLLECTIONS).updateOne({_id:objectId(order__details.user__id)},{
                $inc:{total_purchase:1}
            })
        })
       
    },
    get__cart__products:(user__id)=>{
        return new Promise(async(resolve,reject)=>{
                try{
                let cart = await db.get().collection(collection.CART__COLLECTIONS).findOne({user:objectId(user__id)})
                console.log(cart,'is the user cart')
                if(cart.products) resolve(cart.products)
                else throw 'no products in cart'
                
            }catch(err){
                resolve('no')
                console.log(err,'from the get cart products')
            }
            })
    },
    get__user__orders:(user__id)=>{
        return new Promise(async(resolve,reject)=>{
            console.log('got inside the get user order promise in the user helper.js')
            let orders = await db.get().collection(collection.ORDER__COLLECTION).find({user__id:objectId(user__id)}).sort({_id:-1}).toArray()
            resolve(orders)
        })
    },
    get__ordered__products:(order__id,flag)=>{
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
                        quantity:'$products.quantity',
                        reviewed:'$products.reviewed',
                        returned:'$products.returned'
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
                        item:1,quantity:1,reviewed:1,returned:1,return:1,product:{$arrayElemAt:['$products',0]}
                    }
                }
            ]).toArray()
            if(flag=='review'){
                for(var i = 0 ; i < order__products.length ; i++){
                    order__products[i].review = true
                    order__products[i].return = true
                }
            }else{
                for(var i = 0 ; i < order__products.length ; i++){
                    order__products[i].review = false
                }
            }
            console.log('passed the get__ordered__products aggregation')
            print(order__products,'ljfds')
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
    add__to__wishlist:(pro__id,user__details)=>{
        let proObj = {
            item:objectId(pro__id),
        }
        return new Promise (async(resolve,reject)=>{
            try{
                let user__wishlist = await db.get().collection(collection.WISHLIST__COLLECTION).findOne({user__email:user__details.email})
            if (user__wishlist){
                let proExists = user__wishlist.products.findIndex(product=> product.item==pro__id)
                console.log(proExists)
                if(proExists!= -1){
                    await  db.get().collection(collection.WISHLIST__COLLECTION)
                    .updateOne({user__email:user__details},
                    {
                        $pull:{products:{item:objectId(pro__id)}}
                    }
                    ).then((response)=>{
                        console.log(response)
                        resolve({removeProduct:true})
                    })
                    console.log('redirected to remove from wishlist from add to wishlist because the products already exists in wishlist')
                }
                else{
                    db.get().collection(collection.WISHLIST__COLLECTION).updateOne({user__email:user__details.email},
                        {
                                $push:{products:proObj}
                        }).then((response)=>{
                            resolve('successfully added to wishlist')
                        })
                }
            }else{
                wishlist = {
                    user:objectId(user__details._id),
                    user__email:user__details.email,
                    products:[proObj]
                }
                await db.get().collection(collection.WISHLIST__COLLECTION).insertOne(wishlist).then(async(response)=>{
                    await db.get(collection.PRODUCTS__COLLECTIONS).updateOne({_id:objectId(pro__id)},{
                        $set:{
                            wishlisted:true
                        }
                    }
                    ,{
                        upsert:true
                    })
                    resolve('successfully added to wishlist')
                })
            }
            }catch(err){
                reject(err)
                console.log(err,'is the error that occured in the user__helpers.js while executing the add to wishlist function !!')
            }
        })
    },
    remove__from__wish:(pro__id,user__details)=>{
        console.log(pro__id, user__details,'now in remove from wishlist function in the user__helper.js')
        return new Promise(async(resolve,reject)=>{
            await  db.get().collection(collection.WISHLIST__COLLECTION)
            .updateOne({user__email:user__details},
            {
                $pull:{products:{item:objectId(pro__id)}}
            }
            ).then((response)=>{
                console.log(response)
                resolve({removeProduct:true})
            })
        })
    },
    prime__razorpay:(user__id,price) =>{
        return new Promise (async(resolve,reject)=>{
            var options = {
                amount:price * 100,
                currency:"INR",
                receipt:""+user__id
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
    verify__payment__prime:(details)=>{
        console.log('got inside the verify payment prime promise')
        print(details,'is the detaisl')
        return new Promise ((resolve,reject)=>{
            let hmac =  crypto.createHmac('sha256','liUTofbWu4r68kbcSxU51Wmm')
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if(hmac == details['payment[razorpay_signature]']){
                print('promise done')
                resolve()
            }else{
                reject()
            }
        })
    },
    user__becomes__prime:(userId) =>{
        return new Promise (async(resolve,reject)=>{
            await db.get().collection(collection.USER__COLLECTIONS).updateOne({_id:objectId(userId)},
            {
                $set:{
                    is_member:true
                }
            })
        }).then((done)=>{
            print(done)
        })
    },
    return__product:(user__details,pro__id,order__id) => {
        console.log(pro__id,'is the product id')
        return new Promise (async(resolve,reject) => {
            try{
                await db.get().collection(collection.ORDER__COLLECTION).updateOne({_id:objectId(order__id)},{
                    $set:{status:'returned'}
                })
                let product = await db.get().collection(collection.PRODUCTS__COLLECTIONS).findOne({_id:objectId(pro__id)})
                await db.get().collection(collection.ORDER__COLLECTION) 
                .updateOne({user__id:objectId(user__details._id),'products.item':objectId(pro__id)},
                {
                    $set:{'products.$.returned':true},
                    
                }  
            )
            await db.get().collection(collection.USER__COLLECTIONS).updateOne({_id:objectId(user__details._id)},{
                $inc:{wallet:product.disPrice}
            })
                resolve('done')
            }catch(err){
                reject('Oops something went wrong')
                print(err,'is the error that occured in the return__product function in the user__helper.js')
            }
        })
    },
    referal:(refferalid) => {
        refferalid = refferalid.split(' ').join('')
        return new Promise (async(resolve,reject) => {
            try{
                var user = await db.get().collection(collection.USER__COLLECTIONS).findOne({_id:objectId(refferalid)})
                if(user.is_member){
                    print(user,'the refferal actually works!')
                    await db.get().collection(collection.USER__COLLECTIONS).updateOne({_id:objectId(refferalid)},{
                        $inc:{wallet:1500}
                    })
                    resolve('referral successfull')
                }else{
                    await db.get().collection(collection.USER__COLLECTIONS).updateOne({_id:objectId(refferalid)},{
                        $inc:{wallet:150}
                    })
                }
            }catch(err){
                print(err,'is the error occured in the referal function in the user__helper')
                reject(err)
            }
        })
    },
    wallet__payment:(user__id,total__amount) => { // i have to change the order status here 
        return new Promise(async(resolve,reject) => {
            try{
                let user = await db.get().collection(collection.USER__COLLECTIONS).findOne({_id:objectId(user__id)})
                if(user.wallet > (total__amount-1)){
                    await db.get().collection(collection.USER__COLLECTIONS).updateOne({_id:objectId(user__id)},{
                        $inc:{wallet:-total__amount}
                    }).then((result) => {
                        print(result,'from mongodb in wallet payment function in the user__helper.js')
                        if(result.acknowledged) resolve('payment Successful !')
                        else reject('Something went Wrong')
                    })
                }else{
                    reject('Insufficient money in Wallet')
                }
            }catch(err){
                reject('Oops Something went wrong')
                print(err,'error from wallet payment function in the user__helper')
            }
        })
    },
    update__user:(user__details,req__query) => {
        return new Promise (async(resolve,reject) => {
            try{
                bcrypt.compare(req__query.current__pass,user__details.password).then(async(status) => {
                    if(status){
                        await db.get().collection(collection.USER__COLLECTIONS).updateOne({_id:objectId(user__details._id)},
                {
                    $set:{name:req__query.new__name}
                })
                if(req__query.update__pass=='true'){
                    print('the user is trying to update password')
                    req__query.newpass = await bcrypt.hash(req__query.newpass,10)
                    print(req__query.newpass,'is the new passs')
                    await db.get().collection(collection.USER__COLLECTIONS).updateOne({_id:objectId(user__details._id)},
                    {
                        $set:{password:req__query.newpass}
                    })
                }
                resolve('succesfully updated !')
                    }else{
                        reject('Enter your password Currectly !')
                    }
                })
            }catch(err){
                reject('Oops something went wrong')
                print(err,'err from update user promise in user__helper')
            }
        })
    },
    get__order__details:(order__id) => {
        return new Promise (async(resolve,reject) => {
            try{
                var order__details = await db.get().collection(collection.ORDER__COLLECTION).aggregate([
                    {
                        $match:{_id:objectId(order__id)}
                    },
                    {
                        $project:{
                            total__amount:1,
                            _id:0
                        }
                    }
                ]).toArray()
                print(order__details)
                // 
                var options = {
                    amount:order__details[0].total__amount * 100,
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
                //
            }catch(err){
                reject(err)
            }
        })
    }
}