; ( () => {
    
    const addStation = document.querySelector(".add_station");
    const addStationModal = document.querySelector(".add_station_modal");
    const cancel = document.querySelector(".cancel");
    
    addStation.addEventListener("click", evt => {
        if ( addStationModal.hidden )
            addStationModal.hidden = false;
    });

    cancel.addEventListener("click", evt => {
        evt.preventDefault();
        addStationModal.hidden = true;
    });
    
})();
