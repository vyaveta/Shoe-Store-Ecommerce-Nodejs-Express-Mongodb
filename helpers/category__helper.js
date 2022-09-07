const db = require('../config/connection')
const collection__list = require('../config/collection')
const { resolve } = require('promise')
const objectId = require('mongodb').ObjectId

module.exports={
    get__category__list:(req)=>{
        return new Promise (async(resolve,reject)=>{
            console.log('got inside the get__category')
            var category__list =await db.get().collection(collection__list.CATEGORY__COLLECTIONS).find().toArray()
            // console.log(category__list)
            resolve(category__list)
        })
    },add__category:(data)=>{
        return new Promise (async(resolve,reject)=>{
            db.get().collection(collection__list.CATEGORY__COLLECTIONS).insertOne(data).then((response)=>{
                console.log('got inside the add__category promise ')
                resolve(data)
            })
        })
    },delete__category:(id)=>{
        return new Promise (async(resolve,reject)=>{
            await db.get().collection(collection__list.CATEGORY__COLLECTIONS).deleteOne({_id:objectId(id)}).then((response)=>{
                resolve('done')
            })
        })
    }
}