; ( () => {

    const add_criminal = document.querySelector(".add_criminal");
    const add_criminal_modal = document.querySelector(".add_criminal_modal");
    const webcam_capture = document.querySelector(".capture_web_cam");
    const criminal_getId = document.querySelector(".criminal_getId");
    const officerInCharge = document.querySelector("[name=service_no]");
    const cancel = document.querySelector(".cancel");


    const requestDataModal = (req,cb) => {
        const xhr = new XMLHttpRequest();

        xhr.open(
            "GET",
            "/admin/criminal?type=" + req.type + (req.service_no ? "&serviceNo=" + req.service_no : ""),
            true
        );
        xhr.addEventListener("readystatechange", evt => {
            if ( xhr.readyState === 4 && xhr.status === 200 ) {
                cb(JSON.parse(xhr.responseText));
            }
        });
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send(null);
    };

    add_criminal.addEventListener("click", evt => {

        if ( ! add_criminal_modal.hidden )
            return;

        add_criminal_modal.hidden = false;

        requestDataModal({ type: "stations" }, responseText => {
            const stationList = document.querySelector("[name=station]");
            const { result: [ { station } ] } = responseText;
            station.forEach( station => {
                const option = document.createElement("option");
                option.textContent = station;
                stationList.appendChild(option);
            });
        });

        requestDataModal({ type: "crimes" }, responseText => {
            const crimeList = document.querySelector(".committed_crime");
            responseText.result.forEach( ({ type }) => {
                const option = document.createElement("option");
                option.textContent = type;
                crimeList.appendChild(option);
            });
        });

    });

    webcam_capture.addEventListener("click", evt => {
        evt.preventDefault();
    });

    criminal_getId.addEventListener("click", evt => {
        evt.preventDefault();
    });

    officerInCharge.addEventListener("blur", evt => {
        const serviceNo = evt.target.value;
        requestDataModal({ type: "serviceNumber", service_no: serviceNo }, responseText => {
            const { result } = responseText;
            if ( ! result ) {
                const service_no_err = document.querySelector(".service_no_err");
                service_no_err.textContent = "service number does not exists";
            }
        });
    });

    officerInCharge.addEventListener("focus", evt => {
        const service_no_err = document.querySelector(".service_no_err");
        service_no_err.textContent = "";
    });
    
    cancel.addEventListener("click", evt => {
        evt.preventDefault();
        add_criminal_modal.hidden = true;
    });


})();
