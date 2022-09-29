const db = require("../config/connection");
const collection__list = require("../config/collection");
const { response } = require("express");
const collection = require("../config/collection");
const { resolve, reject } = require("promise");
const objectId = require("mongodb").ObjectId;
const print = console.log;
const table = console.table;

module.exports = {
  add__review: (user__details, review__details) => {
    try {
        review = {
            user:user__details._id,
            user__name:user__details.name,
            review:review__details.userReview,
            rating:review__details.starCount
        }
        print('reporting from above the promise function')
      return new Promise(async (resolve, reject) => {
       print('got inside the promise')
        let ProductReview = await db.get().collection(collection__list.PRODUCT__REVIEW__COLLECTION).findOne({
            pro__id: objectId(review__details.proId)
          });
        if (ProductReview) {
          db.get().collection(collection__list.PRODUCT__REVIEW__COLLECTION).updateOne({
              pro__id: objectId(review__details.proId),
              
            },
            {
                $push:{reviews:review}
            });
        }
        else{ // if the product doesnt have any reviews, we create a document for that product
            review = [{
                user:user__details._id,
                user__name:user__details.name,
                review:review__details.userReview,
                rating:review__details.starCount
            }]
            print('form the else case')
            let document = {
                pro__id: objectId(review__details.proId),
                reviews:review
            }
           await db.get().collection(collection__list.PRODUCT__REVIEW__COLLECTION).insertOne(document).then((res)=>{
                print(res,'from the insert review function ')
            })
        }
        resolve('done')
      });
    } catch (err) {
      console.log(err,"is the error that occured in the add__review function in the product helper.js"
      );
    }
  },
};
