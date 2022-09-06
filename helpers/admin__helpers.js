const db = require('../config/connection')
const collection__list = require('../config/collection')
const bcrypt = require('bcrypt')
const { reject } = require('promise')
const objectId = require('mongodb').ObjectId

module.exports={
    add__admin:(admin__data)=>{
        return new Promise (async(resolve,reject)=>{
            var success = null
            console.log(`Recived a message from ${admin__data.name}`)
            var is__there = await db.get().collection(collection__list.ADMIN__COLLECTIONS).findOne({$or:[{name:admin__data.name},{email:admin__data.email}]})
            if(is__there){
                console.log('account already exists')
                success = false
                resolve(success)
            }
            else if (!is__there){
                console.log('not is__there')
                admin__data.password = await bcrypt.hash(admin__data.password,10)
                db.get().collection(collection__list.ADMIN__COLLECTIONS).insertOne(admin__data)
                success = true
                console.log("the admin added to database - add__admin from admin__helpers")
                resolve(success)
            }
        })
    },
    admin__login:(admin__data)=>{
        return new Promise (async(resolve,reject)=>{
            var success = null
            console.log(`Recived a login request from ${admin__data.name}    - admin__login,admin helpers` )
            var is__there = await db.get().collection(collection__list.ADMIN__COLLECTIONS).findOne({name:admin__data.name})
            if(is__there){
                admin__data.password = bcrypt.compare(admin__data.password,is__there.password).then((status)=>{
                    if(status){
                        console.log(`login process of ${admin__data.name} successful - from admin__login,admin__helpers`)
                        success = true
                        resolve(success)
                    }
                    else{
                        console.log(`login failed the password of ${admin__data.name} doesnt match with the password in the database `)
                        success = false
                        resolve(success)
                    }
                })
            }
            else{
                console.log(`there is not account in the admin database mathing the credentials of ${admin__data.name} -from admin__login`)
                success = false
                resolve(success)
            }
        })
    },
    get__users:(condition)=>{
       return new Promise(async(resolve,reject)=>{
        var site__details = {}
        site__details.user__count = await db.get().collection(collection__list.USER__COLLECTIONS).countDocuments()
        site__details.users = await db.get().collection(collection__list.USER__COLLECTIONS).find().toArray()
        site__details.prime__users__count = await db.get().collection(collection__list.USER__COLLECTIONS).find({is_member:true}).count()
        site__details.prime__users = await db.get().collection(collection__list.USER__COLLECTIONS).find({is_member:true}).toArray()
        site__details.products__count = await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).countDocuments() 
        console.log(site__details.prime__users)
        // console.log(users)   I am commenting this since printing all the user data in the console is a bad idea..
        if(condition=='get__all__users'){
            console.log('got a message from show__users in admin__helpers saying that they shipped the data of all users!')
            resolve(site__details.users)
        }
        else if(condition=='get__users__count'){
            console.log('Recived a message from show__users in admin__helpers saying that they shipped the user count')
            resolve(site__details.users)
        }
        else if(condition == 'get__everything'){
            resolve(site__details)
        }
        else if(condition == 'get__prime__users'){
            resolve(site__details.prime__users)
        }
       })
    },
    delete__user:(user__id)=>{
        return new Promise(async(resolve,reject)=>{
            var deleted__user__name = await db.get().collection(collection__list.USER__COLLECTIONS).findOne({_id:objectId(user__id)},{name:1,_id:0})
         db.get().collection(collection__list.USER__COLLECTIONS).deleteOne({_id:objectId(user__id)}).then((response)=>{
                if(response){
                    console.log(deleted__user__name)
                    // var user__name = deleted__user__details.name
                    resolve('status')
                }
                else{
                    console.log('error occured in delete__user')
                }
            })
           
        })
    },block__user:(user__id)=>{
        return new Promise(async(resolve,reject)=>{
            var user = await db.get().collection(collection__list.USER__COLLECTIONS).findOne({_id:objectId(user__id)})
            db.get().collection(collection__list.USER__COLLECTIONS).updateOne({_id:objectId(user__id)},{$set:{is__blocked:true}}).then((response)=>{
                console.log(`Updation recieved regarding the blocking of the user and the status is ${response}`)
                if(user.is_member){
                    resolve('prime__member')
                }
                else{
                    resolve('normal__user')
                }
            })
        })
    },
    unblock__user:(user__id)=>{
        return new Promise(async(resolve,reject)=>{
            var user = await db.get().collection(collection__list.USER__COLLECTIONS).findOne({_id:objectId(user__id)})
            db.get().collection(collection__list.USER__COLLECTIONS).updateOne({_id:objectId(user__id)},{$set:{is__blocked:false}}).then((response)=>{
                if(user.is_member){
                    resolve('prime__user')
                }
                else{
                    resolve('normal__user')
                }
            })
        })
    },get__allproducts:(condition)=>{
        return new Promise(async(resolve,reject)=>{
            var count = await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).countDocuments()
           var products = await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).find().toArray()
           if(condition == 'product__count'){
            resolve(count)
           }
           else
           resolve(products)
        })
    },get__new__users:()=>{
        return new Promise(async(resolve,reject)=>{
            var new_users = await db.get().collection(collection__list.USER__COLLECTIONS).find().sort({$natural:-1}).limit(10).toArray()
            resolve(new_users)
        })
    }
}