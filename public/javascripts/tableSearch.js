const searchInput = document.getElementById('search')
const rows = document.querySelectorAll('tbody tr')

searchInput.addEventListener('keyup',(event)=>{
    // console.log(event)
    const q = event.target.value.toLocaleLowerCase() // here we use lower case because javascript is case sensitive
    // console.log(q) // this prints the words that we type in the search box
    rows.forEach(row =>{
        // console.log(row)  // this will print the whole table rows
        // row.querySelector('td').textContent.toLocaleLowerCase().includes(q) 
        row.textContent.toLocaleLowerCase().includes(q)
        ? (row.style.display = 'table-row')
        : (row.style.display = 'none')
    })
})