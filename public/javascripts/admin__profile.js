var popBox = document.getElementById('pop__up')
button = document.getElementById('pop__signal')
var close = document.getElementById('close__button')

button.onclick = ()=>{
    console.log('button clicked')
    popBox.style.visibility = 'visible'
}
close.onclick = () =>{
    popBox.style.visibility = 'hidden'
}