; ( () => {

    const select = document.querySelector(".crime_case_item");


    const handleOptionChange = target => {

        const xhr = new XMLHttpRequest();
        const fData = new FormData();

        const liNode = target.parentNode.parentNode;

        const _id = liNode.getAttribute("_data_req");

        xhr.open("POST", "/admin/cases/setstate?_id=" + _id, true);

        xhr.addEventListener("readystatechange", evt => {

            if ( xhr.readyState === 4 && xhr.status === 200 ) {

                const { err } = JSON.parse(xhr.responseText);

                if ( err ) {
                    document.querySelector(".err").textContent = err;
                    return ;
                }

                const { state, class: css_class } = JSON.parse(xhr.responseText);
                const crimeState = liNode.querySelector(".crime_state");


                crimeState.removeAttribute("class");
                crimeState.setAttribute("class", `crime_state ${css_class}`);

                crimeState.textContent = state;
            }
        });

        fData.append("state", target.value);
        xhr.setRequestHeader("X-Requested-With", "XMLHttprequest");
        xhr.send(fData);

    };


    const handleShowMedia = target => {

        const xhr = new XMLHttpRequest();
        const liNode = target.parentNode;
        const _id = liNode.getAttribute("_data_req");

        xhr.open("GET", "/admin/cases/getmedia?_id=" + _id, true);

        xhr.addEventListener("readystatechange", evt => {
            if ( xhr.readyState === 4 && xhr.status === 200 ) {
                console.log(xhr.responseText);
            }
        });
        
        xhr.setRequestHeader("X-Requested-With", "XMLHttprequest");
        xhr.send(null);
    };


    select.addEventListener("click", evt => {

        const { target } = evt;

        switch(target.nodeName.toLowerCase()) {

        case "select": return handleOptionChange(target);

        case "p":
            if ( target.classList.contains("crime_show_media" ) )
                return handleShowMedia(target);

            break;

        default:
            break;

        }


    });

})();
