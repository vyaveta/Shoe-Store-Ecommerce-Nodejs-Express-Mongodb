const lens = document.querySelector('.magnifier-lens')
const product__image= document.querySelector('.img')
const magnified__image = document.querySelector('.magnified__image')
const image__box = document.querySelector('.image__box')

function magnify(product__image,magnified__image){
    lens.addEventListener('mousemove',moveLens)
    lens.addEventListener('mouseout',leaveLens)
    product__image.addEventListener('mousemove',moveLens)
    image__box.addEventListener('mouseout',leaveLens)
    //when mouse is taken out of the image
   
}

function moveLens(e){
   // console.log("x :" +e.pageX+ "Y :" + e.pageY) 
    let x,y,cx,cy;
    //get the position of the cursor
    const product__image__rect = product__image.getBoundingClientRect();
    x = e.pageX - product__image__rect.left - lens.offsetWidth/2;
    y = e.pageY - product__image__rect.top - lens.offsetHeight/2;

    let max_xpos = product__image__rect.width -lens.offsetWidth
    let max_ypos = product__image__rect.height -lens.offsetHeight

    if(x > max_xpos) x = max_xpos
    if(x < 0) x = 0
    if(y > max_ypos) y = max_ypos
    if(y < 0 ) y = 0
    lens.style.cssText = `top:${y}px; left:${x}px`

    // calculate the magnified __img and lens's aspect ratio
    cx = magnified__image.offsetWidth / lens.offsetWidth
    cy = magnified__image.offsetHeight / lens.offsetHeight
    magnified__image.style.backgroundRepeat = `no-repeat`
    magnified__image.style.cssText = `background: url('${product__image.src}')
                -${x * cx}px -${y * cy}px /
                ${product__image__rect.width * cx}px ${product__image__rect.height * cy}px                         
    `;
    lens.classList.add('active')
    magnified__image.classList.add('active')
    // lens.classList.remove('active')
    
}
function leaveLens(){
        lens.classList.remove('active')  
        magnified__image.classList.remove('active')
    }
magnify(product__image,magnified__image);