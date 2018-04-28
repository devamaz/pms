; ( () => {

    const newsList = document.querySelector(".news_list");
    const newsContent = document.querySelector(".news_content");
    const close = newsContent.querySelector(".close");
    const title = newsContent.querySelector(".title");
    const content = newsContent.querySelector(".content");
    
    newsList.addEventListener("click", evt => {

        let target = evt.target;

        if ( HTMLLIElement[Symbol.hasInstance](target) )
            target = target;
        else if ( HTMLParagraphElement[Symbol.hasInstance](target) )
            target = target.parentNode;

        const xhr = new XMLHttpRequest();

        xhr.open("GET", "/readnews?news_id=" + target.getAttribute("data-id") , true );

        xhr.addEventListener("readystatechange", evt => {
            if ( xhr.readyState === 4 && xhr.status === 200 ) {
                const { err, result } = JSON.parse(xhr.responseText);
                if ( err ) {
                    const error = document.querySelector(".err");
                    error.textContent = err;
                    return ;
                }
                newsContent.hidden = false;
                title.textContent = result.title;
                content.textContent = result.content;
            }
        });
        
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.send(null);
    });

    close.addEventListener("click", evt => {
        newsContent.hidden = true;
    });

})();
