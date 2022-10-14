// wishlist
function add__to__wishlist(pro__id){
    console.log('sfljksjflkjfsjsfjkl;fsjfsakldjfklsadjfklkflsdafksadl')
    if(document.getElementById(pro__id+'add').innerHTML=='Add to WishList'){
        console.log(document.getElementById(pro__id+'add').innerHTML,'from add ')
        console.log('got inside')
                  try {
                    console.log("inside the add to wishlist ajax")
                    $.ajax({
                      url: '/users/add__to__wishlist/'+pro__id,
                      method: 'get',
                      success: (response) => {
                        swal('added to wishlist')
                        let span = document.getElementById(pro__id+'add')
                        span.innerHTML = 'Remove from Wishlist'
                      }
                    })
                  } catch (err) {
                    console.log(err, 'is the error occured while executing the ajax function of add to wishlist')
                    location.href = '/users'
                  }
    }else{
        console.log('now else case of add to wishlist')
        remove__from__wishlist(pro__id)
    }
                }
                function remove__from__wishlist(pro__id){
                         console.log(document.getElementById(pro__id+'add').innerHTML,'from remove ')
                     if(document.getElementById(pro__id+'add').innerHTML=='Remove from Wishlist'){
                   try{
                     $.ajax({
                        url:'/users/remove__from__wishlist/'+pro__id,
                    method:'get',
                    success:(response)=>{
                        swal('removed from wishlist')
                        let span = document.getElementById(pro__id+'add')
                        span.innerHTML = 'Add to WishList'
                    }
                    })
                   }catch(err){
                    console.log(err,'is the error occured in the remove from the wishlist ajax function')
                    location.href='/users'
                   }
                     }else{
                        console.log('else case of remove from wishlist')
                        add__to__wishlist(pro__id)
                     }
                }