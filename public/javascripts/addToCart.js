function addToCart(proId){
    $.ajax({
     url:'/users/add__to__cart?product__id='+proId+'&from=home1', ///users/add__to__cart/?product__id={{this._id}}&from=home1
     method:'get',
     success:(response)=>{
         console.log(response)
         if(response.status){
             let count = $('#cart__count').html()
             count=parseInt(count)+1
             $('#cart__count').html(response.count)
         }
         swal('added to shoe store cart')
     }
    })
 }