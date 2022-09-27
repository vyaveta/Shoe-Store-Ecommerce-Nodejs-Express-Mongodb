let address = document.getElementById('address')
let state = document.getElementById('state')
let country = document.getElementById('country')
let pincode = document.getElementById('pincode')
// 
let address__input = document.getElementById('address__input')
let country__input = document.getElementById('country__input')
let state__input = document.getElementById('state__input')
let pincode__input = document.getElementById('pincode__input')

function loadAddress(){
    state__input.value = state.innerHTML
    address__input.innerHTML  = address.innerHTML
    country__input.value = country.innerHTML
    pincode__input.value = pincode.innerHTML
}

// // some code for the razorpay 
// let online = document.getElementById('online__payment')
// let place__order__button = document.getElementById('place__order')
// let rpay__button = document.getElementById('rpay__button')
// let paypay__button = document.getElementById('paypay__button')

// online.onclick = () =>{
//     place__order__button.style.display = 'none'
//     rpay__button.style.visibility = 'visible'
//     paypay__button.style.visibility = 'visible'

// }