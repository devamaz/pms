; ( () => {
    "use strict";

    const imageUpload = document.querySelector("[name=picture]");

    imageUpload.addEventListener("change", evt => {
        const pictureDiv = document.querySelector(".preview-picture");
        const imageLocation = window.URL.createObjectURL(evt.target.files[0]);
        pictureDiv.style.background = `url(${imageLocation}) center no-repeat`;
        pictureDiv.style.backgroundSize = "cover";
    });
    
})();
