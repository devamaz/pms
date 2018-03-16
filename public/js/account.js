; ( () => {

    const more = document.querySelector(".showMore");

    more.addEventListener("click", () => {

        more.disabled = true;

        const xhr = new XMLHttpRequest();

        xhr.open("GET", "/account/crime_reported", true);

        xhr.addEventListener("readystatechange", evt => {
            
            if ( xhr.readyState === 4 && xhr.status === 200 ) {
                more.disabled = false;
                console.log(xhr.responseText);
            }
        });

        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        xhr.send(null);
    });
    
})();
