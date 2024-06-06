const databaseId = "https://portfolio-app-536d7-default-rtdb.firebaseio.com";

function findRecord(objects, id) {
    if(!objects)
        return [];
    const idx = Object.values(objects).findIndex(rec => (parseInt(id) === rec.admId || parseInt(id) === rec.usrId));
    return [
        Object.values(objects)[idx],
        Object.keys(objects)[idx]
    ]
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    let template;
    // get portfolio from database
    fetch(`${databaseId}/portfolios.json`)
        .then(res => {
            if(!res)
                return null;
            return res.json()
        })
        .then(objects => {
            const [portfolio, portfolioId] = findRecord(objects, id);
            const isAdmin = () => portfolio && portfolio.admId === JSON.parse(id);
            let imgURL, sourceURL;
            const task = portfolio ? firebase.storage().ref(portfolio.img).getDownloadURL() : new Promise((res) => res());
            task
            .then((data) => {
                if(!data)
                    return;
                imgURL = data;
                return firebase.storage().ref(portfolio.source).getDownloadURL();
            })
            .then((data) => {
                sourceURL = data;
                if(portfolio) {
                    const editBtnTemplate = isAdmin() ? `<button class="btn btn-mr" type="button" id="edit-btn">Редактировать</button>` : "";
                    const removeBtnTemplate = isAdmin() ? `<button class="btn" type="button" id="remove-btn">Удалить</button>` : "";
                    template = 
                    `
                    <div class="portfolio">
                        <div class="porfolio__content"> 
                            <div class="portfolio__info">
                                <h3 class="typography portfolio__title">${portfolio.title}</h3>
                                <p class="text portfolio_text">${portfolio.text}</p>
                            </div>
                            <div class="portfolio__image">    
                                <img src="${imgURL}" alt="Failed to load the photo">
                            </div>
                        </div>
                        <div class="actions">
                            <a target="_blank" class="btn btn-mr" href="${sourceURL}" download="${sourceURL}">Скачать работу</a>
                            ${editBtnTemplate}
                            ${removeBtnTemplate}
                        </div>
                    </div>
                    `;
                } else {
                    template = 
                    `
                    <div>
                        <h3 class="tac typography portfolio__title">К сожалению, такой работы нет =(</h3>
                    </div>
                    `
                }
                const wrapper = document.getElementById("main-wrapper");
                wrapper.innerHTML = template;
                if(!isAdmin(id))
                    return;
    
                const editBtn = document.getElementById("edit-btn");
                editBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    window.location.replace(`./form.html?id=${portfolio.admId}`);
                })
    
                const removeBtn = document.getElementById("remove-btn");
                removeBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    // send request to database to remove portfolio.
                    fetch(`${databaseId}/portfolios/${portfolioId}.json`, {method:"DELETE"})
                    .then(() => {
                        window.location.replace("index.html");
                    })
                })
            })
        })

})