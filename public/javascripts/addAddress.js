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