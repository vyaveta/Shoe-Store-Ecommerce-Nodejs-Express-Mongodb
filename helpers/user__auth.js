const jwt = require('jsonwebtoken')
require('dotenv')
const user__helper = require('./user__helper')

module.exports={
    usercookieJWTAuth:(req,res,next)=>{
        const usertoken = req.cookies.usertoken
        try{
            const user = jwt.verify(usertoken,process.env.USER_TOKEN_SECRET)
            next()
        }catch(err){
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
    }
    
}