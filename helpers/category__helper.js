const db = require('../config/connection')
const collection__list = require('../config/collection')

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
    }
}