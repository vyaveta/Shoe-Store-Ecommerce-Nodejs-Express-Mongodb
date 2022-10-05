function changeImg(event){
    console.log('change event')
      document.getElementById('imgView1').src = URL.createObjectURL(event.target.files[0])
  }
   const imagebox1 = document.getElementById("image-box1");
const crop_btn1 = document.getElementById("crop-btn1");
const input1 = document.getElementById("image");
// for second one
const imagebox2 = document.getElementById("image-box2");
const crop_btn2 = document.getElementById("crop-btn2");
const input2 = document.getElementById("image2");
// for the third one
const imagebox3 = document.getElementById("image-box3");
const crop_btn3 = document.getElementById("crop-btn3");
const input3 = document.getElementById("image3");
// for the fourth one
const imagebox4 = document.getElementById("image-box4");
const crop_btn4 = document.getElementById("crop-btn4");
const input4 = document.getElementById("image4")

// When user uploads the image this event will get triggered
input1.addEventListener("change", () => {
// Getting image file object from the input variable
const img_data1 = input1.files[0];
// createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
// The new object URL represents the specified File object or Blob object.
const url1 = URL.createObjectURL(img_data1);
// Creating a image tag inside imagebox which will hold the cropping view image(uploaded file) to it using the url created before.
imagebox1.innerHTML = `<img src="${url1}" id="image1" style="width:100%;">`;
// Storing that cropping view image in a variable
const image1 = document.getElementById("image1");
// Displaying the image box
document.getElementById("image-box1").style.display = "block";
// Displaying the Crop buttton
document.getElementById("crop-btn1").style.display = "block";
// Hiding the Post button
document.getElementById("imgView1").style.display = "block";
const cropper1 = new Cropper(image1, {
autoCropArea: 1,
viewMode: 1,
scalable: false,
zoomable: false,
movable: false,
minCropBoxWidth: 50,
minCropBoxHeight: 50,
});
// When crop button is clicked this event will get triggered
crop_btn1.addEventListener("click", () => {
// This method coverts the selected cropped image on the cropper canvas into a blob object
cropper1.getCroppedCanvas().toBlob((blob) => {
  // Gets the original image data
  let fileInputElement1 = document.getElementById("image");
  // let fileInputElement2 = document.getElementById('image2')
  // Make a new cropped image file using that blob object, image_data.name will make the new file name same as original image
  let file1 = new File([blob], img_data1.name, {
    type: "image/*",
    lastModified: new Date().getTime(),
  });
  // Create a new container
  let container1 = new DataTransfer();
  // Add the cropped image file to the container
  container1.items.add(file1);
  // Replace the original image file with the new cropped image file
  fileInputElement1.files = container1.files;
  document.getElementById("imgView1").src = URL.createObjectURL(
    fileInputElement1.files[0]
  );
  // Hide the cropper box
  document.getElementById("image-box1").style.display = "none";
  // Hide the crop button
  document.getElementById("crop-btn1").style.display = "none";
    
});
});
});


// for second one
// When user uploads the image this event will get triggered
input2.addEventListener("change", () => {
try{

// Getting image file object from the input variable
const img_data1 = input2.files[0];

// createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
// The new object URL represents the specified File object or Blob object.
const url1 = URL.createObjectURL(img_data1);

// Creating a image tag inside imagebox which will hold the cropping view image(uploaded file) to it using the url created before.
imagebox2.innerHTML = `<img src="${url1}" id="image2" style="width:100%;">`;

// Storing that cropping view image in a variable
const image2 = document.getElementById("image2");
// Displaying the image box
document.getElementById("image-box2").style.display = "block";
// Displaying the Crop buttton
document.getElementById("crop-btn2").style.display = "block";
// Hiding the Post button
document.getElementById("imgView2").style.display = "block";

const cropper1 = new Cropper(image2, {
autoCropArea: 1,
viewMode: 1,
scalable: false,
zoomable: false,
movable: false,
minCropBoxWidth: 50,
minCropBoxHeight: 50,
});
// When crop button is clicked this event will get triggered
crop_btn2.addEventListener("click", () => {
// This method coverts the selected cropped image on the cropper canvas into a blob object
cropper1.getCroppedCanvas().toBlob((blob) => {
  // Gets the original image data
 
  let fileInputElement1 = document.getElementById('image2')
  // Make a new cropped image file using that blob object, image_data.name will make the new file name same as original image
  let file1 = new File([blob], img_data1.name, {
    type: "image/*",
    lastModified: new Date().getTime(),
  });
  // Create a new container
  let container1 = new DataTransfer();
  // Add the cropped image file to the container
  container1.items.add(file1);
  // Replace the original image file with the new cropped image file
  fileInputElement1.files = container1.files;
  document.getElementById("imgView2").src = URL.createObjectURL(
    fileInputElement1.files[0]
  );
  // Hide the cropper box
  document.getElementById("image-box2").style.display = "none";
  // Hide the crop button
  document.getElementById("crop-btn2").style.display = "none";
    
});
});
}catch(err){
console.log(err,'is the err')
}
});

// now for the third one
// When user uploads the image this event will get triggered
input3.addEventListener("change", () => {
try{
// Getting image file object from the input variable
const img_data1 = input3.files[0];

// createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
// The new object URL represents the specified File object or Blob object.
const url1 = URL.createObjectURL(img_data1);

// Creating a image tag inside imagebox which will hold the cropping view image(uploaded file) to it using the url created before.
imagebox3.innerHTML = `<img src="${url1}" id="image3" style="width:100%;">`;

// Storing that cropping view image in a variable
const image3 = document.getElementById("image3");
// Displaying the image box
document.getElementById("image-box3").style.display = "block";
// Displaying the Crop buttton
document.getElementById("crop-btn3").style.display = "block";
// Hiding the Post button
document.getElementById("imgView3").style.display = "block";

const cropper1 = new Cropper(image3, {
autoCropArea: 1,
viewMode: 1,
scalable: false,
zoomable: false,
movable: false,
minCropBoxWidth: 50,
minCropBoxHeight: 50,
});
// When crop button is clicked this event will get triggered
crop_btn3.addEventListener("click", () => {
// This method coverts the selected cropped image on the cropper canvas into a blob object
cropper1.getCroppedCanvas().toBlob((blob) => {
  // Gets the original image data
 
  let fileInputElement1 = document.getElementById('image3')
  // Make a new cropped image file using that blob object, image_data.name will make the new file name same as original image
  let file1 = new File([blob], img_data1.name, {
    type: "image/*",
    lastModified: new Date().getTime(),
  });
  // Create a new container
  let container1 = new DataTransfer();
  // Add the cropped image file to the container
  container1.items.add(file1);
  // Replace the original image file with the new cropped image file
  fileInputElement1.files = container1.files;
  document.getElementById("imgView3").src = URL.createObjectURL(
    fileInputElement1.files[0]
  );
  // Hide the cropper box
  document.getElementById("image-box3").style.display = "none";
  // Hide the crop button
  document.getElementById("crop-btn3").style.display = "none";
    
});
});
}catch(err){
console.log(err,'is the err')
}
});

// for the fourth one
input4.addEventListener("change", () => {
try{
// Getting image file object from the input variable
const img_data1 = input4.files[0];

// createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
// The new object URL represents the specified File object or Blob object.
const url1 = URL.createObjectURL(img_data1);

// Creating a image tag inside imagebox which will hold the cropping view image(uploaded file) to it using the url created before.
imagebox4.innerHTML = `<img src="${url1}" id="image4" style="width:100%;">`;

// Storing that cropping view image in a variable
const image4 = document.getElementById("image4");
// Displaying the image box
document.getElementById("image-box4").style.display = "block";
// Displaying the Crop buttton
document.getElementById("crop-btn4").style.display = "block";
// Hiding the Post button
document.getElementById("imgView4").style.display = "block";

const cropper1 = new Cropper(image4, {
autoCropArea: 1,
viewMode: 1,
scalable: false,
zoomable: false,
movable: false,
minCropBoxWidth: 50,
minCropBoxHeight: 50,
});
// When crop button is clicked this event will get triggered
crop_btn4.addEventListener("click", () => {
// This method coverts the selected cropped image on the cropper canvas into a blob object
cropper1.getCroppedCanvas().toBlob((blob) => {
  // Gets the original image data
 
  let fileInputElement1 = document.getElementById('image4')
  // Make a new cropped image file using that blob object, image_data.name will make the new file name same as original image
  let file1 = new File([blob], img_data1.name, {
    type: "image/*",
    lastModified: new Date().getTime(),
  });
  // Create a new container
  let container1 = new DataTransfer();
  // Add the cropped image file to the container
  container1.items.add(file1);
  // Replace the original image file with the new cropped image file
  fileInputElement1.files = container1.files;
  document.getElementById("imgView4").src = URL.createObjectURL(
    fileInputElement1.files[0]
  );
  // Hide the cropper box
  document.getElementById("image-box4").style.display = "none";
  // Hide the crop button
  document.getElementById("crop-btn4").style.display = "none";
    
});
});
}catch(err){
console.log(err,'is the err')
}
});