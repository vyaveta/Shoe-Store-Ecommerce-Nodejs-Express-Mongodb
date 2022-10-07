let cat__type = document.getElementById('cat__type')
let all = document.getElementById('all')
let cat__name = document.querySelectorAll('.cat__name')

//Adding event to every cat__name
for(var i =0; i<cat__name.length;i++){
    if(cat__name[i].innerHTML==cat__type.innerHTML) cat__name[i].classList.add('active')
    else if(cat__type.innerHTML=='all__categories') all.classList.add('active')
}
console.log('the script is running peacefully ')