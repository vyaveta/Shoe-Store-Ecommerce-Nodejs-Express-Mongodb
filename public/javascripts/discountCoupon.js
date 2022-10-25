try{
  var final__amount
  let total__product__price = document.getElementById('total__product__price')
  let total__dis__amount = document.getElementById('distotal_cart_amt')
  let total__amount = document.getElementById('total_cart_amt')
  let discount__p = document.getElementById('discount__p')
  total__dis__amount.innerHTML = parseInt(total__dis__amount.innerHTML) + 100
  total__amount.innerHTML = parseInt(total__product__price.innerHTML) + 100
  final__amount = total__dis__amount.innerHTML
  try{
 
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
          swal('added to wishlist')
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
          swal('removed from wishlist')
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
  


  if(document.getElementById('coupon__button__remove')){
    checkCouponBtn()
  }else if(document.getElementById('coupon__button__add')){
    checkApplyBtn()
  }
   

 function checkCouponBtn (){
    document.getElementById('coupon__button__remove').addEventListener('click' , removeCoupon)
   }

 function checkApplyBtn(){
  document.getElementById('coupon__button__add').addEventListener('click' , applyCoupon)
 }


 // apply coupon function
 function applyCoupon(){
  //alert(e.target.id)
  var dis__div = document.querySelector('.dis__div')
  if(!discount__input.value) document.getElementById('error_trw').innerHTML=`<p style="color:red;">You have not Entered anything!</p>`
  else{
    // if(total__dis__amount.innerHTML>response.coupon.min__purchase__amount){
      $.ajax({
          url:'/users/apply__coupon?entered__code='+discount__input.value,
          method:'get',
          success:(response) => {
              if(response.status){
                  log(response)
                      // var multiplier = Number(Number(100-response.coupon.discount)/100)
                      // total__amount = multiplier*total__dis__amount.innerHTML
                       total__dis__amount.innerHTML = Math.round(response.total)
                      swal(response.msg)
                      document.getElementById('error_trw').innerHTML=response.msg
                      document.getElementById('coupon__msg').innerText = 'Coupon Applied'
                      discount__input.disabled = true
                      document.getElementById('coupon__button__add').removeEventListener('click' , applyCoupon )
                      document.getElementById('coupon__button__add').id = 'coupon__button__remove'
                      document.getElementById('coupon__button__remove').innerHTML = 'remove'
                      document.getElementById('coupon__button__remove').classList.remove('btn-success')
                      document.getElementById('coupon__button__remove').classList.add('btn-danger')
                      console.log(document.getElementById('coupon__button__remove'))
                      checkCouponBtn()
                   //   dis__div.style.display = 'none'// have to change this later!
                  // swal(response.coupon.discount,'is the discount and min purchase amount is ',response.coupon.min__purchase__amount)
              }else{
                document.getElementById('error_trw').innerHTML=response.msg
                  swal(response.msg)
              }
          }
      })
  //   }else{
  //     document.getElementById('error_trw').innerHTML=`<p style="color:red;">The minimum price amount to use this coupon isnt crossed</p>`
  //     swal('The minimum price amount to use this coupon isnt crossed')
  // }

  }
 }

 // Remove coupon function
 function removeCoupon(){
    $.ajax({
      url:'/users/remove__coupon',
      method:'delete',
      success:(res) => {
        if(res.status){
          total__dis__amount.innerHTML = Math.round(res.total)
          swal(res.msg)
          discount__input.disabled = false
          discount__input.value = ''
          document.getElementById('coupon__button__remove').removeEventListener('click' , removeCoupon)
          document.getElementById('coupon__button__remove').id = 'coupon__button__add'
          document.getElementById('coupon__button__add').innerHTML ='Apply'
          document.getElementById('coupon__button__add').classList.remove('btn-danger')
          document.getElementById('coupon__button__add').classList.add('btn-success')
          document.getElementById('error_trw').innerHTML='Coupon removed!'
          document.getElementById('coupon__msg').innerText = ' Add a discount code (optional)'
          checkApplyBtn()
        }
      }
    })
  }


    checkout = () => {
        console.log('checkout button clickedd')
   location.href='/users/checkout?totalPrice='+total__dis__amount.innerHTML
    }
  }catch(err){
    swal(err)
  }
  
}catch(err){
  console.log(err,'is the error')
}