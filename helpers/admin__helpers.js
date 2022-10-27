const db = require("../config/connection");
const collection__list = require("../config/collection");
const bcrypt = require("bcrypt");
const { reject } = require("promise");
const collection = require("../config/collection");
const objectId = require("mongodb").ObjectId;
const print = console.log;

module.exports = {
  add__admin: (admin__data) => {
    return new Promise(async (resolve, reject) => {
      var success = null;
      console.log(`Recived a message from ${admin__data.name}`);
      var is__there = await db
        .get()
        .collection(collection__list.ADMIN__COLLECTIONS)
        .findOne({
          $or: [{ name: admin__data.name }, { email: admin__data.email }],
        });
      if (is__there) {
        console.log("account already exists");
        success = false;
        resolve(success);
      } else if (!is__there) {
        console.log("not is__there");
        admin__data.password = await bcrypt.hash(admin__data.password, 10);
        db.get()
          .collection(collection__list.ADMIN__COLLECTIONS)
          .insertOne(admin__data);
        success = true;
        console.log(
          "the admin added to database - add__admin from admin__helpers"
        );
        resolve(success);
      }
    });
  },
  admin__login: (admin__data) => {
    return new Promise(async (resolve, reject) => {
      var success = null;
      console.log(
        `Recived a login request from ${admin__data.name}    - admin__login,admin helpers`
      );
      var is__there = await db
        .get()
        .collection(collection__list.ADMIN__COLLECTIONS)
        .findOne({ name: admin__data.name });
      if (is__there) {
        admin__data.password = bcrypt
          .compare(admin__data.password, is__there.password)
          .then((status) => {
            if (status) {
              console.log(
                `login process of ${admin__data.name} successful - from admin__login,admin__helpers`
              );
              success = true;
              resolve(is__there);
            } else {
              console.log(
                `login failed the password of ${admin__data.name} doesnt match with the password in the database `
              );
              success = false;
              resolve(success);
            }
          });
      } else {
        console.log(
          `there is not account in the admin database mathing the credentials of ${admin__data.name} -from admin__login`
        );
        success = false;
        resolve(success);
      }
    });
  },
  get__users: (condition) => {
    return new Promise(async (resolve, reject) => {
      var site__details = {};
      site__details.user__count = await db
        .get()
        .collection(collection__list.USER__COLLECTIONS)
        .countDocuments();
      site__details.users = await db
        .get()
        .collection(collection__list.USER__COLLECTIONS)
        .find()
        .toArray();
      site__details.prime__users__count = await db
        .get()
        .collection(collection__list.USER__COLLECTIONS)
        .find({ is_member: true })
        .count();
      site__details.prime__users = await db
        .get()
        .collection(collection__list.USER__COLLECTIONS)
        .find({ is_member: true })
        .toArray();
      site__details.products__count = await db
        .get()
        .collection(collection__list.PRODUCTS__COLLECTIONS)
        .countDocuments();
      console.log(site__details.prime__users);
      // console.log(users)   I am commenting this since printing all the user data in the console is a bad idea..
      if (condition == "get__all__users") {
        console.log(
          "got a message from show__users in admin__helpers saying that they shipped the data of all users!"
        );
        resolve(site__details.users);
      } else if (condition == "get__users__count") {
        console.log(
          "Recived a message from show__users in admin__helpers saying that they shipped the user count"
        );
        resolve(site__details.users);
      } else if (condition == "get__everything") {
        resolve(site__details);
      } else if (condition == "get__prime__users") {
        resolve(site__details.prime__users);
      }
    });
  },
  delete__user: (user__id) => {
    return new Promise(async (resolve, reject) => {
      var action = {};
      var deleted__user = await db
        .get()
        .collection(collection__list.USER__COLLECTIONS)
        .findOne({ _id: objectId(user__id) });
      await db
        .get()
        .collection(collection__list.DELETED__ACCOUNTS)
        .insertOne(deleted__user)
        .then((response) => {

                    var today = new Date()
                    var dd = String(today.getDate()).padStart('2',0)
                    var mm = String(today.getMonth()+1).padStart('2',0)
                    var yyyy = today.getFullYear()
                    today = mm + '-' + dd + '-' + yyyy

          action.action = "Deleted a User Account";
          action.deletedAccountName = deleted__user.name;
          action.details = `deleted the account of ${deleted__user.name}`;
          action.deletedAccountId = deleted__user._id;
          action.date = today;
          db.get()
            .collection(collection__list.ADMIN__ACTIONS)
            .insertOne(action)
            .then((response) => {
              db.get()
                .collection(collection__list.USER__COLLECTIONS)
                .deleteOne({ _id: objectId(user__id) })
                .then((response) => {
                  if (response) {
                    console.log(deleted__user);
                    // var user__name = deleted__user__details.name
                    resolve(
                      `Successfuly deleted the account of ${deleted__user.name} , Any way you can undo the deletion from admin actions!!`
                    );
                  } else {
                    console.log("error occured in delete__user");
                  }
                });
            });
        });
    });
  },
  block__user: (user__id) => {
    return new Promise(async (resolve, reject) => {
      var user = await db
        .get()
        .collection(collection__list.USER__COLLECTIONS)
        .findOne({ _id: objectId(user__id) });
      db.get()
        .collection(collection__list.USER__COLLECTIONS)
        .updateOne({ _id: objectId(user__id) }, { $set: { is__blocked: true } })
        .then((response) => {
          console.log(
            `Updation recieved regarding the blocking of the user and the status is ${response}`
          );
          if (user.is_member) {
            resolve("prime__member");
          } else {
            resolve("normal__user");
          }
        });
    });
  },
  unblock__user: (user__id) => {
    return new Promise(async (resolve, reject) => {
      var user = await db
        .get()
        .collection(collection__list.USER__COLLECTIONS)
        .findOne({ _id: objectId(user__id) });
      db.get()
        .collection(collection__list.USER__COLLECTIONS)
        .updateOne(
          { _id: objectId(user__id) },
          { $set: { is__blocked: false } }
        )
        .then((response) => {
          if (user.is_member) {
            resolve("prime__user");
          } else {
            resolve("normal__user");
          }
        });
    });
  },
  get__allproducts: (condition) => {
    return new Promise(async (resolve, reject) => {
      var count = await db
        .get({deleted:false})
        .collection(collection__list.PRODUCTS__COLLECTIONS)
        .countDocuments();
      var products = await db
        .get()
        .collection(collection__list.PRODUCTS__COLLECTIONS)
        .find({deleted:false}).hint( { $natural : -1 } )

        .toArray();
      if (condition == "product__count") {
        resolve(count);
      } else resolve(products);
    });
  },
  get__new__users: () => {
    return new Promise(async (resolve, reject) => {
      var new_users = await db
        .get()
        .collection(collection__list.USER__COLLECTIONS)
        .find()
        .sort({ $natural: -1 })
        .limit(10)
        .toArray();
      resolve(new_users);
    });
  },
  get__admin__action: () => {
    return new Promise(async (resolve, reject) => {
      var data;
      data = await db
        .get()
        .collection(collection__list.ADMIN__ACTIONS)
        .find()
        .toArray();
      resolve(data);
    });
  },
  undo__user__deletion: (id) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection__list.DELETED__ACCOUNTS)
        .findOne({ _id: objectId(id) });
      db.get()
        .collection(collection__list.USER__COLLECTIONS)
        .insertOne(user)
        .then((response) => {
          db.get()
            .collection(collection__list.ADMIN__ACTIONS)
            .deleteOne({ deletedAccountId: objectId(id) })
            .then((response) => {
              db.get()
                .collection(collection__list.DELETED__ACCOUNTS)
                .deleteOne({ _id: objectId(id) })
                .then((response) => {
                  resolve("successfuly undone the deletion ");
                });
            });
        });
    });
  },
  get__all__orders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection__list.ORDER__COLLECTION)
        .find().sort({order__date:1}) // this sort is not working properly ! 
        .toArray();
        console.log(orders)
      // let user__name = await db.get().collection(collection__list.USER__COLLECTIONS).find().toArray()
      console.log(orders[0].user__id);
      console.log(orders,'is the orders that we got from the get__all__orders in the admin module')
      resolve(orders);
    });
  },
  change__order__status: (order__id, status) => {
    return new Promise(async (resolve, reject) => {
      if (status == "pending" || status == "placed" || status == "shipped") {
        await db
          .get()
          .collection(collection__list.ORDER__COLLECTION)
          .updateOne(
            { _id: objectId(order__id) },
            {
              $set: { status: status ,cancel:false,review:false},
            }
          )
          .then((response) => {
            print(response);
            if (response) {
              resolve("done");
            } else {
              reject("not updated");
            }
          });
      } else if (status == 'delivered'){
        await db
        .get()
        .collection(collection__list.ORDER__COLLECTION)
        .updateOne(
          { _id: objectId(order__id) },
          {
            $set: { status: status ,cancel:true,review:true,return:true},
          }
        )
        .then((response) => {
          print(response);
          if (response) {
            resolve("done");
          } else {
            reject("not updated");
          }
        });
      }
      else {
        await db
          .get()
          .collection(collection__list.ORDER__COLLECTION)
          .updateOne(
            { _id: objectId(order__id) },
            {
              $set: { status: status ,cancel:true,review:false},
            },{
                upsert:true
            }
          )
          .then((response) => {
            print(response);
            if (response) {
              resolve("done");
            } else {
              reject("not updated");
            }
          });
      }
    });
  },
  get__users__total__purchase:() => {
    return new Promise (async(resolve,reject) => {
     try{
      let most__purchased__users = await db.get().collection(collection__list.USER__COLLECTIONS).find().sort({total_purchase:-1}).limit(7).toArray()
      resolve(most__purchased__users)
     }catch(err){
      reject('Oops something went wrong!')
      print(err,'is the error that occured in the get users total pruchase function in the admin helpers.js')
     }
    })
  }
};
