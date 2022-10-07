
var final__amount
    let total__product__price = document.getElementById('total__product__price')
    let total__dis__amount = document.getElementById('distotal_cart_amt')
    let total__amount = document.getElementById('total_cart_amt')
    let discount__p = document.getElementById('discount__p')
    total__dis__amount.innerHTML = parseInt(total__dis__amount.innerHTML) + 100
    total__amount.innerHTML = parseInt(total__product__price.innerHTML) + 100
    final__amount = total__dis__amount.innerHTML
try {
    if (total__dis__amount.innerHTML == total__amount.innerHTML) {
      total__amount.classList.remove('se')
      total__amount.style.visibility = 'hidden'
    }
  } catch (err) {
    console.log(err)
  }
  // js function for change product quantity                                                                                                           
  function changeQuantity(cart__id, pro__id, count) {
    try {
      let product__box = document.getElementById(pro__id + 'box')
      let quantity = document.getElementById(pro__id).innerHTML
      let total__product__price = document.getElementById('total__product__price')
      let total__amount = document.getElementById('total_cart_amt')

      console.log(quantity)
      quantity = Number(quantity)
      console.log(quantity, 'is the quantity')
      count = parseInt(count)
      $.ajax({
        url: '/users/changeProductQuantity',
        data: {
          cart: cart__id,
          product: pro__id,
          count: count,
          quantity: quantity
        },
        method: 'post',
        success: (response) => {
          if (response.removeProduct) {
            // alert('product Removed from cart')
            showAlertBox('Added to ShoeStore Cart')
            //location.reload()
            product__box.style.display = 'none'
            console.log("code is running smoothly i mean the js code in cart page")
            $('#cart__count').html(response.count)
            $('#total__product__price').html(response.total.total)
            $('#total_cart_amt').html(response.total.total + 100)
            $('#distotal_cart_amt').html(response.total.disTotal + 100)
            console.log(response.total)
          } else {
            document.getElementById(pro__id).innerHTML = quantity + count
            $('#total__product__price').html(response.total.total)
            $('#total_cart_amt').html(response.total.total + 100)
            $('#distotal_cart_amt').html(response.total.disTotal + 100)
          }
        }
      })
    } catch (err) {
      console.log(err)
    }
  }
  // now some code for the add to wishlist 
  // nowsome code for wishlist
  function add__to__wishlist(pro__id) {
    try {
      console.log("inside the add to wishlist ajax")
      $.ajax({
        url: '/users/add__to__wishlist/' + pro__id,
        method: 'get',
        success: (response) => {
          alert('added to wishlist')
        }
      })
    } catch (err) {
      console.log(err, 'is the error occured while executing the ajax function of add to wishlist')
      location.href = '/users'
    }
  }

  // remove from wishlist 
  function remove__from__wishlist(pro__id) {
    try {
      $.ajax({
        url: '/users/remove__from__wishlist/' + pro__id,
        method: 'get',
        success: (response) => {
          alert('removed from wishlist')
          // location.reload()
          let div = document.getElementById(pro__id + 'wish')
          div.style.display = 'none'
        }
      })
    } catch (err) {
      console.log(err, 'is the error occured in the remove from the wishlist ajax function')
      location.href = '/users'
    }
  }


try{
    const log = console.log
log('the discount coupon script is running peacefully')

var discount__input = document.getElementById('discount_code1')

discount_code = () => {
    if(!discount__input.value) swal('Enter the coupon code')
    else{
        $.ajax({
            url:'/users/apply__coupon?entered__code='+discount__input.value,
            method:'get',
            success:(response) => {
                if(response.status){
                    log(response)
                    if(total__dis__amount.innerHTML>response.coupon.min__purchase__amount){
                        var multiplier = Number(Number(100-response.coupon.discount)/100)
                        total__amount = multiplier*total__dis__amount.innerHTML
                        total__dis__amount.innerHTML = total__amount
                        swal(response.msg)
                    }else if (discount__input.value){
                        swal('You have already entered the coupon')
                    }else{
                        swal('The minimum price amount to use this coupon isnt crossed')
                    }
                    // swal(response.coupon.discount,'is the discount and min purchase amount is ',response.coupon.min__purchase__amount)
                }else{
                    swal(response.msg)
                }
            }
        })
    }
}
    checkout = () => {
        console.log('checkout button clickedd')
   location.href='/users/checkout?totalPrice='+total__dis__amount.innerHTML
    }
}catch(err){
    swal(err)
}