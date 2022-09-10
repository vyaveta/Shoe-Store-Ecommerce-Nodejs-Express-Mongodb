
let searchInput = document.getElementById('search')
let rows = document.querySelectorAll('tbody tr')
console.log(rows)

searchInput.addEventListener('keyup',(event)=>{
    console.log(event)
    let q = event.target.value.toLowerCase()  // stores everthing we type into the variable q
    rows.forEach(row =>{
        console.log(row.textContent)
        row.textContent.toLocaleLowerCase().includes(q) ? row.style.display = '' : row.style.display = 'none'
    }) 
})