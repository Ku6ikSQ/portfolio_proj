function themeToggle(theme) {
    return theme === "dark" ? "light" : "dark";
}

document.addEventListener("DOMContentLoaded", () => {
    const themeSwitcher = document.getElementById("theme-switcher");
    const THEME = "theme";
    const theme = localStorage.getItem(THEME);
    document.body.classList.remove(themeToggle(theme));
    document.body.classList.add(theme);

    themeSwitcher.addEventListener("click", () => {
        const theme = document.body.classList.contains("dark") ? "light" : "dark";
        document.body.classList.add(theme);
        document.body.classList.remove(themeToggle(theme));
        localStorage.setItem(THEME, theme);
    })
});