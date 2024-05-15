function isValidID(id) {
    return  /^[+-]?\d+(\.\d+)?$/.test(id);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-create");

    form.addEventListener("submit", (e) => {
        const idInput = document.getElementById("id-input");

        e.preventDefault();
        const id = idInput.value;
        if(!isValidID(id)) {
            form.classList.add("error");
            return;
        }

        form.classList.remove("error");
        const data = { id };
        console.log(JSON.stringify(data));
        // send request to server to login
        const status = true;
        if(status) {
            window.location.replace(`./portfolio.html?id=${data.id}`);
        }
        form.reset();
    });
})