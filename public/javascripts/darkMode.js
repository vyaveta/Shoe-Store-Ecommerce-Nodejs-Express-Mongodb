let body = document.querySelector('body')
let dark = document.getElementById('dark')
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