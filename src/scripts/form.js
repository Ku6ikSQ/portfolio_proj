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
            <p class="text" style="margin-bottom: 5px;">Код администратора: ${admId}</p>
            <p class="text" style="margin-bottom: 5px;">Код гостя: ${usrId}</p>
            <button class="btn" id="btn-back">Вернуться на главную</button>
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

function imageToBase64(imageFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
}

function getPhotos(photos) {
    // if(!photos.length) return new Promise((res) => res());
    // return Array.from(photos).map(photo => imageToBase64(photo))
    return new Promise((res) => {
        const arr = Array.from(photos).map(photo => imageToBase64(photo));
        Promise.all(arr).then((data) => {
            res(data);
        })
    })
}

function uploadFile(file) {
    return new Promise((res) => {
        const fname = getRandom(4) + "_" + file.name;
        const storageRef = firebase.storage().ref('files/' + fname);
        storageRef.put(file).then((snapshot) => {
            res(fname)
        //   getDownloadURL(snapshot.ref).then((downloadURL) => {
        //     res(downloadURL);
        //   });
        })
    })
}
  

const databaseId = "https://portfolio-app-536d7-default-rtdb.firebaseio.com";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const form = document.getElementById("form-create");
    const titleInput = document.getElementById("title_input");
    const textInput = document.getElementById("text_input");
    const imgInput = document.getElementById("img_input");
    const sourceInput = document.getElementById("source_input");
    const createBtn = document.getElementById("create-form");
    const formTitle = document.getElementById("form-title");
    const formProgress = document.getElementById("form-progress");
    let edit = id && id.length > 0;
    if(edit) {
        formTitle.textContent = "Изменение работы"
        createBtn.textContent = "Сохранить изменения";
    }
    fetch(`${databaseId}/portfolios.json`)
    .then(res => res.json())
    .then(objects => {
        let [portfolio, portfolioId] = findRecord(objects, id);
        if(portfolio) {
            titleInput.value = portfolio.title;
            textInput.value = portfolio.text;
        } else {
            portfolio = {};
        }
        return [portfolio, portfolioId];
    })
    .then(([portfolio, portfolioId]) => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            formProgress.classList.add("pure-material-progress-linear-active");
            if(edit) {
                const rf = database.ref('portfolios/' + portfolioId);
                rf.update({
                    title: titleInput.value,
                    text: textInput.value,
                })
                .then(() => {
                    if(sourceInput.files[0]) 
                        return uploadFile(sourceInput.files[0]);
                })
                .then((sourceURL) => {
                    if(!sourceURL)
                        return;
                    rf.update({
                        source: sourceURL
                    })
                })
                .then(() => {
                    if(imgInput.files.length)
                        return getPhotos(imgInput.files);
                })
                .then((photos) => {
                    if(photos) 
                        rf.update({
                            photos: photos,
                        })
                })
                .then(() => {
                    // NOTE: comment it (3 rows below) for dev mode
                    const response = grecaptcha.getResponse();
                    if(response.length === 0)
                        return;
                    form.reset();
                    formProgress.classList.remove("pure-material-progress-linear-active");
                    document.getElementById("signup").innerHTML = getMessage(portfolio.admId, portfolio.usrId, edit);
                    const btnBack = document.getElementById("btn-back")
                    if(edit)
                        btnBack.addEventListener("click", () => window.location.replace(`./portfolio.html?id=${id}`))
                })
            } else {
                if(!titleInput.value || !textInput.value || !imgInput.files.length || !sourceInput.files[0]) {
                    form.classList.add("error");
                    return;
                } else
                    form.classList.remove("error");
                //get photos urls and save it into storage1
                let obj;
                uploadFile(sourceInput.files[0])
                .then((sourceURL) => {
                    getPhotos(imgInput.files)
                    .then((photos) => {
                        console.log(photos);
                        obj = {
                            title: titleInput.value,
                            text: textInput.value,
                            admId: getRandom(16),
                            usrId: getRandom(20),
                            photos: photos,
                            source: sourceURL,
                        }
                        // NOTE: comment it (3 rows below) for dev mode
                        const response = grecaptcha.getResponse();
                        if(response.length === 0)
                            return;
                        database.ref('portfolios/').push(obj);
                    })
                    .then(() => {
                        form.reset();
                        formProgress.classList.remove("pure-material-progress-linear-active");
                        document.getElementById("signup").innerHTML = getMessage(obj.admId, obj.usrId, edit);
                        const btnBack = document.getElementById("btn-back")
                        btnBack.addEventListener("click", () => window.location.replace(`./index.html`))
                    })
                })
            }
        });
    })
});