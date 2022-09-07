let body = document.querySelector('body')
let dark = document.getElementById('dark')

console.log('script is running peacefully')

let darkMode = localStorage.getItem('darkMode')
const darkmode = ()=>{
        body.classList.add('darkmode')
        localStorage.setItem('darkMode','enabled')
}
const disable__darkmode = ()=>{
    body.classList.remove('darkmode')
    localStorage.setItem('darkMode',null)
}

// if(localStorage.getItem('darkMode')) {
//     body.classList.add('darkmode');
// }

dark.onclick = ()=>{
    darkMode = localStorage.getItem('darkMode')
    if(darkMode !=='enabled'){
        dark.innerHTML = 'Light mode'
        darkmode()
    }else  {
        dark.innerHTML = 'Dark mode'
        disable__darkmode()
       }
}
if(darkMode == 'enabled'){
    dark.innerHTML = 'Light mode'
    darkmode()
}
