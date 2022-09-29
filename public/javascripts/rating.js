// code for the popup to appear
let btn = document.querySelectorAll('.the__button')  // using the query selector all because its dynamic and the user may have ordered multiple products, so for every product , have a review btn with same class name
let starWrapper = document.querySelector('.stars')
let stars = document.querySelectorAll(".stars a")
let textArea = document.getElementById('review__text')
let rate = document.querySelectorAll('.rate')
let starCount = 0
let userReview
let proId 
console.log(btn)

// let btn = document.getElementById('review__button')
let cancelBtn = document.getElementById('submit__cancel')
let popUp = document.querySelector('.review__popup')
 
for(var i = 0; i < btn.length; i++){           // registering event for every review button in the page
    btn[i].addEventListener('click', function(btn) {
        proId = btn.target.id
            popUp.classList.remove('hide')
            // code for the star rating
            stars.forEach((star, clickedIndex) => {
                star.addEventListener( 'click', () => {
                 starWrapper.classList.add('disabled')
                 stars.forEach((otherStar,otherIndex) => {
                     if(otherIndex <= clickedIndex){
                         otherStar.classList.add('active')
                     }
                 })
                 starCount = clickedIndex + 1
                })
             })
    })
}
cancelBtn.addEventListener('click', () => {  // the cancel button is working properly so i dont really need to do the same thing that i did with the review button
    popUp.classList.add('hide')
})

function submitReview(){
    popUp.classList.add('hide')
    for(i = 0 ; i < rate.length ; i++){
        rate[i].classList.remove('active')
    }
    userReview = textArea.value
    console.log(userReview, starCount, 'and the product that this user has reviewed is ' ,proId)
    // and now  userReview contains the review made by the user , starCount contains the rating given by the user and the proId contains the product id thet the user has reviewed
    starWrapper.classList.remove('disabled')
    document.getElementById(proId).innerHTML = 'Review Submitted'

    // and now we have to pass the collected values to the ajax 
    $.ajax({
        url:'/users/rateProduct/?proId='+proId+'&starCount='+starCount+'&userReview='+userReview,
        method:'get',
        success:(response)=>{
            alert(response)
        }
    })
}