; ( () => {

    const addPoliceNews = document.querySelector(".add_police_news");
    const cancel = document.querySelector(".cancel");
    const addPoliceNewsModal = document.querySelector(".add_police_news_modal");
    const newsList = document.querySelector(".news_list");


    const newsHandler = Object.defineProperties( {} , {
        listElement: {
            value(target) {

                const pNode = target.parentNode;
                const content = target.querySelector(".news_item_content");
                const hiddenEl = pNode.querySelector(".news_item_content:not([hidden])");

                if ( ! content.hidden ) {
                    content.hidden = true;
                    return ;
                }
                
                if ( ! hiddenEl ) {
                    content.hidden = false;
                    return ;
                }

                hiddenEl.hidden = true;
                content.hidden = false;

                return ;

            }
        },
        deleteButton: {
            value(pNode) {

                const xhr = new XMLHttpRequest();
                const fData = new FormData();

                xhr.open("DELETE", "/admin/news" , true );

                xhr.addEventListener("readystatechange", evt => {

                    if ( xhr.readyState === 4 && xhr.status === 200 ) {

                        const { done } = JSON.parse(xhr.responseText);

                        if ( ! done ) {
                            const err = document.querySelector(".err");
                            err.textContent = "Cannot delete news";
                            return ;
                        }

                        const parentNode = pNode.parentNode;
                        const allNews = parentNode.querySelectorAll(".news_item");

                        pNode.remove();
                        
                        if ( allNews.length - 1 === 0 ) {
                            location.assign("/admin/news");
                        }
 
                    }
                });

                fData.append("delete_num", pNode.getAttribute("data_news_num"));
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.send(fData);
            }
        }
    });

    cancel.addEventListener("click", evt => {
        evt.preventDefault();
        addPoliceNewsModal.hidden = true;
    });

    addPoliceNews.addEventListener("click", evt => {
        if ( addPoliceNewsModal.hidden )
            addPoliceNewsModal.hidden = false;
    });

    newsList.addEventListener("click" , evt => {

        const target = evt.target;

        if ( HTMLLIElement[Symbol.hasInstance](target) )
            return newsHandler.listElement(target);

        if ( HTMLParagraphElement[Symbol.hasInstance](target) )
            return newsHandler.listElement(target.parentNode);

        if ( HTMLButtonElement[Symbol.hasInstance](target) )
            return newsHandler.deleteButton(target.parentNode);


    });
})();
