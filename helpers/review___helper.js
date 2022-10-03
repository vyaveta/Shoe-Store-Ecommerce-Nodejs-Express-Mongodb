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
    var average__r
    let totalR
    let rating = review__details.starCount * 1
    try {
        review = {
            user:user__details._id,
            user__name:user__details.name,
            review:review__details.userReview,
            rating:review__details.starCount * 1
        }
      return new Promise(async (resolve, reject) => {
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
            // now add the total star rating in product collection 
            let product = await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).findOne({_id:objectId(review__details.proId)})
            print(product,'from the you know it right alkfj')
            if(product.average__rating){
                average__r = product.average__rating
            }
            if(product.total__ratings){
                print(product.total__ratings,'is the total rating ')
                if(product.total__ratings == 0)
                {
                    totalR = 1
                }
                else{
                    totalR = product.total__ratings
                }
            }
            else{
                totalR = 1
            }
            var rating_divider = totalR +1
            var r = Number((average__r*totalR))+Number((review__details.starCount ))
            var final =r / rating_divider
            console.log(rating_divider,'is the rating diveider and r :',r,'final :',final)
            print(totalR,'is the total rating and average rating is ', average__r)
            await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).updateOne({_id:objectId(review__details.proId)},
            {
                $set:{average__rating:final},
                $inc:{total__ratings:1}
            },
            {
                upsert:true
            })
        }
        else{ // if the product doesnt have any reviews, we create a document for that product
            review = [{
                user:user__details._id,
                user__name:user__details.name,
                review:review__details.userReview,
                rating:review__details.starCount * 1
            }]
            print('form the else case')
            let document = {
                pro__id: objectId(review__details.proId),
                reviews:review
            }
           await db.get().collection(collection__list.PRODUCT__REVIEW__COLLECTION).insertOne(document).then((res)=>{
                print(res,'from the insert review function ')
            })

            let product = await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).findOne({_id:objectId(review__details.proId)})
            print(product,'from the you know it right alkfj')
            if(product.total__ratings){
                if(product.total__ratings == 0)
                {
                    totalR = 1
                }
                else{
                    totalR = product.total__ratings 
                }
            }
            else{
                totalR = 1
            }
            await db.get().collection(collection__list.PRODUCTS__COLLECTIONS).updateOne({_id:objectId(review__details.proId)},
            {
                $set:{average__rating:rating/ totalR},
                $inc:{total__ratings:1}
            },
            {
                upsert:true
            })
        }
        // 

        await db.get().collection(collection__list.ORDER__COLLECTION) 
        .updateOne({user__id:objectId(user__details._id),'products.item':objectId(review__details.proId)},
        {
            $set:{'products.$.reviewed':true},
            
        }  
    )
        resolve('done')
      });
    } catch (err) {
      console.log(err,"is the error that occured in the add__review function in the product helper.js"
      );
    }
  },
  get__productreviews:(product__id)=>{
    return new Promise(async(resolve,reject)=>{
        let reviews = db.get().collection(collection__list.PRODUCT__REVIEW__COLLECTION).aggregate([
            {
                $match:{pro__id:objectId(product__id)}
            },
            {
                $unwind:'$reviews'
            },
            {
                $project:{
                    user__id:'$reviews.user',
                    user__name:'$reviews.user__name',
                    review:'$reviews.review',
                    rating:'$reviews.rating'
                }
            }
        ]).toArray()
        resolve(reviews)
    })
  }
};
