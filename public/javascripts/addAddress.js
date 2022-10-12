let pop__up = document.querySelector('.address__popup')
let trigger__button = document.getElementById('address__button')
let cover = document.querySelector('.container')
let back = document.querySelector('.back')
trigger__button.onclick = ()=>{
    cover.classList.add('blur')
    pop__up.classList.remove('hide')
}
back.onclick = ()=>{
    cover.classList.remove('blur')
    pop__up.classList.add('hide')
}

// Now some code for the change user details // update user credentials 
var changePass = false
var change__password = document.getElementById('change__password')
var new__pass__div = document.querySelector('.new__pass__div')
var update__profile = document.getElementById('update__profile')
change__password.onclick = (e) => {
    changePass = true
    console.log('clicked')
    new__pass__div.style.display = ''
}

update__profile.onclick = (e) => {
try{
    var new__user__name = document.getElementById('exampleInputEmail1').value
   var current__password = document.getElementById('exampleInputPassword1').value
   var new__password = document.getElementById('exampleInputPassword2').value
   if(current__password=='' || new__user__name.trim()=='' || new__password.lenght<3 || new__user__name.lenght>10) throw  'Format not allowed !'
   if(changePass){
    if(new__password.trim()=="" || new__password.lenght>3 || new__password.lenght < 20) throw "Invalid Format for password"
   }
}catch(err){
    console.log(err)
    swal(err)
}

}