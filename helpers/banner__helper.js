const db = require('../config/connection')
const collection__list = require('../config/collection')
const { reject } = require('promise')
const objectId = require('mongodb').ObjectId
const print = console.log

exports.get__all__banners = () => {
    return new Promise (async(resolve,reject) => {
        try{
            let banners = await db.get().collection(collection__list.BANNER__COLLECTION).find().toArray()
            if(banners) resolve(banners)
            else reject('No banners found')
        }catch(err){
            reject('Oops something went wrong!!')
            print(err,'is the error that occured in the get  all banners funcction in the banner helper.js')
        }
    })
}
exports.add__banner = (banner) => {
    return new Promise (async(resolve,reject) => {
        try{
            await db.get().collection(collection__list.BANNER__COLLECTION).insertOne(banner).then((response) => {
                if(response.acknowledged){
                print(response.insertedId,'is the inserted id and the banner successfuly added to the database!')
                resolve([response.insertedId,'Banner successfuly added !'])
                }else{
                    reject('Oops something went wrong')
                }
            })
        }catch(err){
            print(err,'is the error occuren in the add__banner function in the banner__helper.js')
            reject('Oops something went wrong')
        }
    })
}

exports.delete__banner = (banner__id) => {
    return new Promise ( async (resolve,reject) => {
        try{
            await db.get().collection(collection__list.BANNER__COLLECTION).deleteOne({_id:objectId(banner__id)}).then((result) => {
                print(result ,'is the result that we got from the database delete function that is coded in the banner__helper.js')
                if(result.acknowledged) resolve('Successfuly deleted the banner')
                else reject('Ops something went wrong , banner not deleted')
            })
        }catch(err){
            print(err,'is the error that occured in the delete__banner function in the banner__helper.js')
        }
    })
}