let pop__up = document.querySelector('.address__popup')
let trigger__button = document.getElementById('address__button')
let body = document.querySelector('.container')
let back = document.querySelector('.back')
trigger__button.onclick = ()=>{
    body.classList.add('blur')
    pop__up.classList.remove('hide')
}
back.onclick = ()=>{
    body.classList.remove('blur')
    pop__up.classList.add('hide')
}