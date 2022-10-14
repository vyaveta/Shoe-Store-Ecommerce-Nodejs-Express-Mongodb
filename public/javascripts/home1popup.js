const popup = document.querySelector('.popup');
 const close2 = document.querySelector('.close');


 // Ajax

$.ajax({
    url:'/users/get__user__details',
    method:'get',
    success:(response) => {
        console.log(response)
        if(response){
            if(response.total_purchase==0){
                loadPopup()
            }
        }
    }
})

loadPopup = () =>
 { 
    setTimeout(function () {
     popup.style.display = "block"; 
// Add some time delay to show popup
 }, 2000) }

close2.addEventListener('click' , () => { 
    popup.style.display = "none";
 })


  var copyButton = document.getElementById('copyButton')
    copyButton.onclick = (e) => {
        // Copy the text inside the text field
        navigator.clipboard.writeText('FP01002xyNew');

        // Alert the copied text
        e.target.innerText = 'Copied!'

    }