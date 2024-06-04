function isValidURL(url) {
    let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(url);
}

function getRandom(len) {
    return Math.floor(Math.random()*10**len);
}

const getMessage = (admId, usrId, edit) => {
    if(edit) {
        return `
            <div class="info">
                <h3 class="tac typography" style="margin-bottom: 20px;">Изменения внесены</h3>
                <button class="btn" id="btn-back">Вернуться к просмотру</button>
            </div>
        `;
    } else {
        return `
        <div class="info">
            <h3 class="tac typography" style="margin-bottom: 5px>Портфолио создано</p>
            <p class="text" style="margin-bottom: 5px;">Your admin code: ${admId}</p>
            <p class="text" style="margin-bottom: 5px;">Your user code: ${usrId}</p>
        </div>
    `;
    }
    
}

function findRecord(objects, id) {
    if(!objects)
        return [];
    const idx = Object.values(objects).findIndex(rec => (parseInt(id) === rec.admId));
    return [
        Object.values(objects)[idx],
        Object.keys(objects)[idx]
    ]
}

const databaseId = "https://portfolio-app-536d7-default-rtdb.firebaseio.com";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const form = document.getElementById("form-create");
    const titleInput = document.getElementById("title_input");
    const textInput = document.getElementById("text_input");
    const workInput = document.getElementById("work_input");
    const imgInput = document.getElementById("img_input");
    const createBtn = document.getElementById("create-form");
    const formTitle = document.getElementById("form-title");
    let edit = id && id.length > 0;
    if(edit) {
        formTitle.textContent = "Изменение работы"
        createBtn.textContent = "Сохранить изменения";
    }
    fetch(`${databaseId}/portfolios.json`)
        .then(res => res.json())
        .then(objects => {
            const [portfolio, portfolioIdx] = findRecord(objects, id);

            if(portfolio) {
                titleInput.value = portfolio.title;
                textInput.value = portfolio.text;
                workInput.value = portfolio.work;
            }
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const title = titleInput.value;
                const text = textInput.value;
                const work = workInput.value;
                const img = imgInput.files[0];
                const imgName = img ? getRandom(5) + "_" + img.name : portfolio.img;
                if(!isValidURL(work)) {
                    form.classList.add("error");
                    return;
                }
                form.classList.remove("error");
                
                let admId = getRandom(16);
                let usrId = getRandom(20);
                if(edit) {
                    admId = portfolio.admId;
                    usrId = portfolio.usrId;
                }
 
            const data = { title, text, work, img: imgName, admId, usrId, };
            new Promise(res => {
                // NOTE: comment it (3 rows below) for dev mode
                const response = grecaptcha.getResponse();
                if(response.length === 0)
                    return;
                if(img) {
                    const storageRef = firebase.storage().ref(imgName);
                    const task = storageRef.put(img);
                    task.on('state_changed', function progress() {}, function error(err) {}, function complete() {
                        res();
                    })
                }
            })
                .then(() => {
                    if(edit) {
                        fetch(`${databaseId}/portfolios/${portfolioIdx}.json`, {method: "DELETE"});
                    }
                })
                .then(() => {
                    fetch(`${databaseId}/portfolios.json`, {method: "POST", body: JSON.stringify(data)});
                })
                .then(() => {
                    form.reset();
                    document.getElementById("signup").innerHTML = getMessage(admId, usrId, edit);
                    if(edit)
                        document.getElementById("btn-back").addEventListener("click", () => window.location.replace(`./portfolio.html?id=${id}`))
                })
        });
    })
}); 

