const db = require('../config/connection')
const collection__list = require('../config/collection')
const { response } = require('express')
const { resolve, reject } = require('promise')
const objectId = require('mongodb').ObjectId
const print = console.log
const table = console.table

module.exports = {
    get__total__category__sales:()=>{
        return new Promise(async(resolve,reject)=>{
            let total__category__sales = await db.get().collection(collection__list.ORDER__COLLECTION).aggregate([
                {
                    $match:{}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        payment__method:1,order__date:1,status:1,total__amount:1,
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection__list.PRODUCTS__COLLECTIONS,
                        localField:'item',
                        foreignField:'_id',
                        as:'category'
                    }
                },
                {
                    $project:{
                        // payment__method:1,order__date:1,status:1,total__amount:1,category:{$arrayElemAt:['$category.category',0]}
                       _id:0,category:{$arrayElemAt:['$category.category',0]}
                    }
                },
                // {
                //     $group:{
                //         category:'$category'
                //     }
                // }
            ]).toArray()
            print(total__category__sales,'got it (dunno whats gonna happen)')
            resolve(total__category__sales)
        })
    },
    findOrders:()=>{
        return new Promise (async(resolve,reject)=>{
            let data = await db.get().collection(collection__list.ORDER__COLLECTION).aggregate([
                {
                    $match:{
                        order__date:{$gte:new Date(new Date - 60*60*24*1000*7)}
                    }
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        year:{$year:'$order__date'},
                        month:{$month:'$order__date'},
                        day:{$dayOfMonth:'$order__date'},
                        dayOfWeek:{$dayOfWeek:'$order__date'}
                    }
                },
                {
                    $group:{
                        _id:'$dayOfWeek',
                        count:{$sum:1},
                        details:{$first:'$$ROOT'}
                    }
                },
                {
                    $sort:{details:1}
                }
            ]).toArray()
            print(data,'is the data gotten')
            resolve(data)
        })
    }
}