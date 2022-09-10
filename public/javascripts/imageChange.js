function viewImage(event){
    document.getElementById('img__view').src=URL.createObjectURL(event.target.files[0])
}