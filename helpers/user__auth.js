const jwt = require('jsonwebtoken')
require('dotenv')
const user__helper = require('./user__helper')
const print = console.log
const table = console.table
let user__details

module.exports={
    usercookieJWTAuth:(req,res,next)=>{
        const usertoken = req.cookies.usertoken
        try{
            const user = jwt.verify(usertoken,process.env.USER_TOKEN_SECRET)
            user__details = user
            next()
        }catch(err){
            print('got inside the usercookie auth function in user__auth.js')
            console.log('error occured in userauth.js')
            res.clearCookie('usertoken')
            return res.redirect('/users/login')
        }
    },
    userLoggedIn:(req,res,next)=>{
        try{
            const usertoken = req.cookies.usertoken
            console.log(usertoken)
            const user = jwt.verify(usertoken,process.env.USER_TOKEN_SECRET)
            res.redirect('/')
        }catch(err){
            res.clearCookie('usertoken')
            next()
        }
    },isBlocked:(req,res,next)=>{
        user__helper.is__blocked()
    },
    
    // this is a simple function but very usefull when we need to get the user details at a certain point in code 
    get__user__details:()=>{
       // table(user__details)
        return user__details
    }
    
}