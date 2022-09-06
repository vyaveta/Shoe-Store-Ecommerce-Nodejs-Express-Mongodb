const jwt = require('jsonwebtoken')
require('dotenv').config()



module.exports={
    adminCookieJWTAuth:(req,res,next)=>{
        const admintoken = req.cookies.admintoken;
        console.log(admintoken)
        try{
            const admin = jwt.verify(admintoken,process.env.ADMIN_TOKEN_SECRET);
            console.log(admin)
            next()
        }catch(err){
            console.log('error detected in auth.js')
            res.clearCookie('admintoken')
            return res.redirect('/admin/login')
        }
    },
    adminLoggedIn:(req,res,next)=>{
        console.log('got inside the adminLogged')
       console.log('again got into')
        try{
            const admintoken = req.cookies.admintoken
            console.log(admintoken)
            console.log('got this far')
            const admin = jwt.verify(admintoken,process.env.ADMIN_TOKEN_SECRET);
            // req.admin = admin;
            return res.redirect('/admin')
           
        }catch(err){
            // console.log(err)
            console.log('error occoured in adminLoggedIn')
            res.clearCookie('admintoken')
            next()
        }
    }
}