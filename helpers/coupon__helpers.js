const db = require("../config/connection");
const collection__list = require("../config/collection");
const bcrypt = require("bcrypt");
const { reject } = require("promise");
const objectId = require("mongodb").ObjectId;
const print = console.log;

exports.find__all__coupons=()=>{
    return new Promise (async(resolve,reject)=>{
     try{
        var coupons =  await db.get().collection(collection__list.COUPONS__COLLECTIONS).find().sort({$natural:-1}).toArray()
         if(coupons[0]!=null){
            resolve(coupons)
         }else{
            resolve('no__coupons__here :(')
         }
     }catch(err){
        print('An error occured in the coupon__helpers.js find__all__coupons function and the error is ',err)
        reject(err)
     }
    })
}