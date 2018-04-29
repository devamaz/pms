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
        
        script.setAttribute("__added__script", "true");

        script.src = "/js/preview-image.js";
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

    const transferToStation = (evt,parentNode) => {

        const { target } = evt;
        const gen = handlePoliceBtn.__cover(parentNode, true);
        const fData = new FormData();

        fData.append("station", target.getAttribute("__station"));

        handlePoliceBtn.transfer( parentNode , fData , xhr => {
            const { done } = JSON.parse(xhr.responseText);
            gen.next();
            if ( ! gen.next(done).value ) return ;
            location.assign("/admin/police");
        });
    };

    const assignNumberHandler = evt => {

        const xhr = new XMLHttpRequest();
        const inputEl = evt.target;
        const caseListNumber = inputEl.parentNode.querySelector(".case_list_n");

        caseListNumber.setAttribute("style", "display: block");

        xhr.open("GET", `/admin/cases/case_number?casen=${inputEl.value}`, true);

        xhr.addEventListener("readystatechange", evt => {

            if ( xhr.readyState === 4 && xhr.status === 200 ) {

                const { result } = JSON.parse(xhr.responseText);
                const lis = document.querySelectorAll(".case_item_n");

                if ( result.length === 0 ) {
                    if ( lis.length !== 0 ) {
                        Array.from(lis, el => el.remove());
                    }
                    caseListNumber.removeAttribute("style");
                    return ;
                }

                result.forEach( res => {
                    Array.from(lis, _list => {
                        if ( res.case_number === _list.textContent ) {
                            _list.remove();
                        }
                    });
                });

                result.forEach( res => {

                    const li = document.createElement("li");

                    li.setAttribute("class", "case_item_n");

                    li.addEventListener("click", evt => {
                        inputEl.value = evt.target.textContent;
                        caseListNumber.removeAttribute("style");
                    });

                    li.textContent = res.case_number;

                    caseListNumber.appendChild(li);

                });
            }

        });


        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send(null);
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
                    console.log(done);
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
                console.log(parentNode);
                makeRequest({
                    method: cb ? "POST" : "GET",
                    serviceNumber: this.__serviceNumber(parentNode),
                    pnode: parentNode,
                    data: data ? data : null }, cb ||

                            function (xhr) {

                                const { done } = JSON.parse(xhr.responseText);

                                gen.next();

                                if ( ! gen.next(done).value ) return ;

                                const { stations } = JSON.parse(xhr.responseText);
                                const stationList = parentNode.querySelector(".station_list");

                                if ( stationList.childElementCount !== 0 ) {
                                    stationList.hidden = false;
                                    return ;
                                }
                                
                                stations.forEach( station => {
                                    const li = document.createElement("li");
                                    li.setAttribute("class", "station_item");
                                    li.setAttribute("__station", station.station_id);
                                    li.addEventListener("click", evt => transferToStation(evt,parentNode));
                                    li.textContent = station.station_id;
                                    stationList.appendChild(li);
                                });

                                stationList.hidden = false;

                            });

            }
        },
        assignto: {
            value(parentNode) {

                const target = parentNode.querySelector(".assignto");
                const assignModal = target.querySelector(".assign");
                const assignNumber = target.querySelector(".assign_number");
                const assignSubmit = target.querySelector(".assign_submit");
                const closeModal = target.querySelector(".close_assign");

                assignModal.setAttribute("style", "display: block;");
                assignNumber.addEventListener("keyup", assignNumberHandler);

                assignSubmit.addEventListener("click", () => {

                    const gen = this.__cover(parentNode, true);
                    const data = new FormData();

                    data.append("casen", assignNumber.value);

                    makeRequest({
                        method: "POST" ,
                        serviceNumber: this.__serviceNumber(parentNode),
                        data,
                        pnode: parentNode
                    }, xhr => {

                        const { done } = JSON.parse(xhr.responseText);

                        if ( ! done ) {
                            const err = document.querySelector(".err");
                            err.textContent = "Cannot assign police officer to case";
                            return ;
                        }

                        location.assign("/admin/police");

                    });

                });

                closeModal.addEventListener("click", () => {
                    assignModal.removeAttribute("style");
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


})();
