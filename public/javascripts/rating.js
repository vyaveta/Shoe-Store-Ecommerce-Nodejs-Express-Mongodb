// code for the popup to appear
let btn = document.querySelectorAll('.the__button')  // using the query selector all because its dynamic and the user may have ordered multiple products, so for every product , have a review btn with same class name
let starWrapper = document.querySelector('.stars')
let stars = document.querySelectorAll(".stars a")
let textArea = document.getElementById('review__text')
let rate = document.querySelectorAll('.rate')
let returnButton = document.querySelectorAll('.return__button')
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
    document.getElementById(proId).style.pointerEvents = 'none'

    // and now we have to pass the collected values to the ajax 
    $.ajax({
        url:'/users/rateProduct/?proId='+proId+'&starCount='+starCount+'&userReview='+userReview,
        method:'get',
        success:(response)=>{
            swal(response)
        }
    })
}

for(var i = 0; i<returnButton.length ; i++){
    console.log(returnButton[i])
    returnButton[i].addEventListener('click',(e) => {
        e.target.classList.add('sus')
        returnButtonClick(e.target.id)
    })
}
returnButtonClick = (id) => {
    var order__id = document.getElementById('order__id').innerHTML
    console.log(order__id,'is the order id')
    swal({
        title: "Are you sure?",
        text: "Do you really Want to return this Product",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
         
          $.ajax({
            url:'/users/return__product?pro__id='+id+'&order__id='+order__id,
            method:'patch',
            success:(response) => {
                if(response) {
                 swal("You will get shoeStore coins after our staff collects your Product", {  icon: "success",});
                 document.querySelector('.sus').style.display='none'
                }else swal('Oops something went wrong! ')
            }
          })
        } else {
          swal("Cancelled");
        }
      });
}