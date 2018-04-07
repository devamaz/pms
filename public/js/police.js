; ( () => {


    const policeImage_capture = document.querySelectorAll(".police_image input");
    const fireAddPoliceModal = document.querySelector(".add_police");
    const closeModal = document.querySelector(".cancel");
    const policeImage = document.querySelector(".police_image");
    const btnPolice = document.querySelector(".police_info");

    const buildScript = () => {
        let checkScriptStatus = document.querySelector("[__added__script=true]");
        if ( checkScriptStatus )
            checkScriptStatus.remove();

        const script = document.createElement("script");
        script.src = "/js/preview-image.js";
        script.setAttribute("__added__script", "true");
        document.body.appendChild(script);
    };

    const buildFileInput = () => {

        if ( document.querySelector(".file_upload") )
            return true;

        const label = document.createElement("label");
        const input = document.createElement("input");

        input.type = "file";
        input.name = "picture";
        input.required = true;
        input.classList.add("upload");
        label.classList.add("required");
        label.classList.add("file_upload");
        label.appendChild(input);

        let camcapture = document.querySelector(".web_cam_capture");

        if ( camcapture ) {
            camcapture.remove();
            camcapture = undefined;
        }
        policeImage.appendChild(label);
        buildScript();
        return true;
    };

    const buildWebCamCapture = () => {

        if ( document.querySelector(".web_cam_capture") )
            return true;

        const label = document.createElement("label");
        const button = document.createElement("button");

        label.classList.add("web_cam_capture");
        label.classList.add("required");
        button.classList.add("capture");
        button.required = true;
        button.textContent = "Capture";
        label.appendChild(button);

        let finput = document.querySelector(".file_upload");

        if ( finput ) {
            finput.remove();
            document.querySelector("[__added__script=true]").remove();
            document.querySelector(".preview-picture").removeAttribute("style");
            finput = undefined;
        }

        policeImage.appendChild(label);
        return true;
    };


    Array.prototype.slice.call(policeImage_capture)
        .forEach ( x => {
            x.addEventListener("click", evt => {
                if ( evt.target.checked && evt.target.value === "webcam" ) {
                    return buildWebCamCapture();
                }

                if ( evt.target.checked && evt.target.value === "file" ) {
                    return buildFileInput();
                }
                return false;
            });
        });


    fireAddPoliceModal.addEventListener("click", evt => {
        const policeModal = document.querySelector(".add_police_modal");
        policeModal.hidden = false;
    });

    closeModal.addEventListener("click", evt => {
        evt.preventDefault();
        const policeModal = document.querySelector(".add_police_modal");
        policeModal.hidden = true;
    });

    btnPolice.addEventListener("click", evt => {

        const target = evt.target;

        if ( ! HTMLButtonElement[Symbol.hasInstance](target) )
            return ;


        const xhr = new XMLHttpRequest();
        const parentNode = target.parentNode.parentNode;
        const serviceNumberEl = parentNode.querySelector(".service_no");

        const cover = document.createElement("div");
        cover.classList.add("cover");
        parentNode.appendChild(cover);

        xhr.open("DELETE", "/admin/police?serviceNo=" + serviceNumberEl.getAttribute("__value-data"), true);

        xhr.addEventListener("readystatechange", evt => {

            if ( xhr.readyState === 4 && xhr.status === 200 ) {

                const { done } = JSON.parse(xhr.responseText);
                
                cover.remove();

                if ( ! done ) {
                    const err = document.querySelector(".err");
                    err.textContent = "Cannot Delete Data";
                    return ;
                }

                const allPolice = document.querySelectorAll(".police_info_list");
                
                parentNode.remove();
                
                if ( (allPolice.length - 1 ) === 0 )  {
                    location.assign("/admin/police");
                }
                
                
            }
        });

        xhr.setRequestHeader("X-Requested-With", "XMLHttprequest");

        xhr.send(null);
    });

})();
