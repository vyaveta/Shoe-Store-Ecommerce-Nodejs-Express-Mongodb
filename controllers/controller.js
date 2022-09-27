exports.update__user__profile = (req,res)=>{
    try{
        let Image = req.files.image
    Image.mv(`public/userProfile/${req.params.id}.jpg`,(err,done)=>{
      if(!err){
        console.log('success')
        res.redirect('/users/profilePage')
      }
    })
    }catch(err){
        console.log('an error occured in the first ever controller in your project and the error is ',err)
        res.redirect('/admin/profilePage')
    }
}