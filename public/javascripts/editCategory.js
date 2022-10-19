const pop__up2 = document.getElementsByClassName('pop__up__category__edit')
const edit__btn = document.getElementById('category__edit')
const cancel2 = document.getElementById('cancel2')
const edit__form = document.getElementById('the__edit__form')
let old__cat__name = document.getElementById('old')
let cat__id = document.getElementById('_id')
let new__name

editCategory = (id,old__name) => {
    old__cat__name.value = old__name
    cat__id.value = id
    console.log(pop__up2)
   pop__up2[0].classList.remove('hide')
}
cancel2.onclick = (e) => {
    pop__up2[0].classList.add('hide')
}

edit__form.onsubmit = (e) => {
    e.preventDefault()
    $.ajax({
        url:'/admin/edit__category',
        data:$('#the__edit__form').serialize(),
        method:'put',
        success: (response) => {
            cancel2.click()
            swal(response.msg)
            console.log(document.getElementById(cat__id.value+'name'))
            document.getElementById(cat__id.value+'name').innerText=response.new__name
        }
    })
}