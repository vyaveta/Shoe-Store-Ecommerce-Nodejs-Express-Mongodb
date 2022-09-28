const alert__btn = document.querySelector('.alert')
const alertBox = document.querySelector('.alert__box')
const close = document.querySelector('.close__alert')
let timer;

// alert__btn.addEventListener('click',(e)=>{
//     console.log('alert button clicked')
//    showAlertBox()
// })
function hideAlertBox()  {
   alertBox.classList.remove('show')
   alertBox.classList.add('hide')
}
close.addEventListener('click',(e)=>{
    hideAlertBox()
    clearTimeout()
})
function  showAlertBox(msg){
console.log('im show alert box')
    alertBox.classList.remove('hide')
    alertBox.classList.add('show')
    if(alertBox.classList.contains('none')){
        alertBox.classList.remove('none')
    }
    //now hide the animation after 5sec
    timer = setTimeout(()=>{
        hideAlertBox()
    },5000)
}