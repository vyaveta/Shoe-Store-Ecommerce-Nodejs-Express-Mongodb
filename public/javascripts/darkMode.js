let body = document.querySelector('body')
let dark = document.getElementById('dark')
<<<<<<< HEAD
let darkMode = localStorage.getItem('darkMode')

console.log('script is running peacefully')

const darkmode = ()=>{
        body.classList.add('darkmode')
        localStorage.setItem('darkMode','enabled')
}
const disable__darkmode = ()=>{
    body.classList.remove('darkmode')
    localStorage.setItem('darkMode',null)
}
if(darkMode==null){
    dark.innerHTML = 'Dark mode'
    disable__darkmode()
}


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


=======
let section1_2 = document.querySelector('.section__1_2')
let header = document.querySelector(".header")
let sidemenu = document.querySelector('.side__menu')

dark.onclick = ()=>{
    if(dark.checked==true){
        body.classList.add('darkmode')
        section1_2.classList.add('darkmode')
        header.classList.add('darkmode')
        sidemenu.classList.add('darkmode')
    }else{
        body.classList.remove('darkmode')
        section1_2.classList.remove('darkmode')
        header.classList.remove('darkmode')
        sidemenu.classList.remove('darkmode')
    }
}
>>>>>>> 4b47ecb4a1f5c00338ee3dd258bb85aed527af07
