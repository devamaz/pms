; ( () => {


    const policeImage_capture = document.querySelectorAll(".police_image input");
    const fireAddPoliceModal = document.querySelector(".add_police");
    const closeModal = document.querySelector(".cancel");
    const policeImage = document.querySelector(".police_image");
    const btnPolice = document.querySelector(".police_info");
    const stationList = document.querySelector(".station_list");

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


    const handlePoliceBtn = Object.defineProperties( {}, {
        __serviceNumber: {
            value(parentNode) {
                return parentNode.querySelector(".service_no");
            },
            enumerable: false,
            writeable: false,
            configurable: false
        },
        __cover: {
            *value(parentNode, remove) {
                /*** generator ***/
                const cover = document.createElement("div");
                cover.classList.add("cover");

                parentNode.appendChild(cover);

                if ( remove )
                    return (yield cover.remove());

                if ( ! (yield) ) {
                    const err = document.querySelector(".err");
                    err.textContent = "Cannot Delete Data";
                    yield false;
                }
            }
        },
        delete: {
            value(parentNode) {

                const gen = this.__cover(parentNode, true); /****** starting generator ******/


                makeRequest({ method: "DELETE" , serviceNumber: this.__serviceNumber(parentNode), pnode: parentNode }, xhr => {

                    const { done } = JSON.parse(xhr.responseText);

                    gen.next(); /**** calling next ***/

                    if ( ! gen.next(done).value ) return ;

                    parentNode.remove();

                    const allPolice = document.querySelectorAll(".police_info_list");

                    if ( allPolice.length === 0 )  {
                        location.assign("/admin/police");
                    }
                });

            }
        },
        transfer: {
            value(parentNode,data,cb) {

                const gen = this.__cover(parentNode, true);

                makeRequest({
                    method: cb ? "POST" : "GET",
                    serviceNumber: this.__serviceNumber(parentNode),
                    pnode: parentNode,
                    data: data ? data : null }, cb ||

                            function (xhr) {

                                const { done } = JSON.parse(xhr.responseText);

                                gen.next();

                                if ( ! gen.next(done).value ) return ;

                                const { stations: [ { station: stations } ] } = JSON.parse(xhr.responseText);
                                const stationList = document.querySelector(".station_list");

                                if ( stationList.childElementCount !== 0 ) {
                                    stationList.hidden = false;
                                    return ;
                                }

                                stations.forEach( station => {
                                    const li = document.createElement("li");
                                    li.setAttribute("class", "station_item");
                                    li.setAttribute("__station", station);
                                    li.textContent = station;
                                    stationList.appendChild(li);
                                });

                                stationList.hidden = false;

                            });

            }
        }
    });


    const makeRequest = ({ method, serviceNumber, pnode, data },cb) => {

        const xhr = new XMLHttpRequest();

        xhr.open(method, "/admin/police?serviceNo=" + serviceNumber.getAttribute("__value-data"), true);

        xhr.addEventListener("readystatechange", evt => {

            if ( xhr.readyState === 4 && xhr.status === 200 ) {
                cb(xhr);
            }
        });

        xhr.setRequestHeader("X-Requested-With", "XMLHttprequest");
        xhr.send(data);
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


        try {
            handlePoliceBtn[target.getAttribute("class")](target.parentNode.parentNode);
        } catch(ex) {
            console.log(ex);
        }

    });

    stationList.addEventListener("click", evt => {

        const { target } = evt;

        if ( ! HTMLLIElement[Symbol.hasInstance](target) )
            return ;

        //li
        const parentNode = target.parentNode.parentNode.parentNode.parentNode;
        const gen = handlePoliceBtn.__cover(parentNode, true);
        const fData = new FormData();

        fData.append("station", target.getAttribute("__station"));

        handlePoliceBtn.transfer( parentNode , fData , xhr => {

            const { done } = JSON.parse(xhr.responseText);

            gen.next();

            if ( ! gen.next(done).value ) return ;

            location.assign("/admin/police");


        });


    });

})();
