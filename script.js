const app = document.getElementById("app");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort");
const themeToggle = document.getElementById("theme-toggle");
const statusMessage = document.getElementById("status-message");
const spinner = document.getElementById("spinner");

let allMeals = [];
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

function showSpinner() {
    if (spinner) spinner.classList.add("visible");
    app.innerHTML = "";
}

function hideSpinner() {
    if (spinner) spinner.classList.remove("visible");
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

async function fetchAllMeals() {
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");

    const requests = letters.map(letter =>
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`)
            .then(res => res.json())
            .then(data => data.meals || [])
            .catch(() => [])
    );

    const results = await Promise.all(requests);
    allMeals = results.flat();
}

function populateCategories() {
    const categories = [...new Set(allMeals.map(m => m.strCategory))].sort();

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

function display(meals) {
    if (!meals.length) {
        app.innerHTML = `<p class="no-results">No meals found</p>`;
        return;
    }

    app.innerHTML = meals.map(meal => `
        <div class="card" data-id="${meal.idMeal}">
            <img src="${meal.strMealThumb}" />
            <div class="card-body">
                <h3>${meal.strMeal}</h3>
                <p class="category">${meal.strCategory}</p>
                <button class="fav-btn ${favourites.includes(meal.idMeal) ? "active" : ""}" data-id="${meal.idMeal}">
                    ${favourites.includes(meal.idMeal) ? "❤️ Saved" : "🤍 Favourite"}
                </button>
            </div>
        </div>
    `).join("");
}

function applyFilters() {
    const query = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const sortBy = sortSelect.value;

    let result = allMeals
        .filter(m => m.strMeal.toLowerCase().includes(query))
        .filter(m => !category || m.strCategory === category)
        .sort((a, b) => {
            if (sortBy === "az") return a.strMeal.localeCompare(b.strMeal);
            if (sortBy === "za") return b.strMeal.localeCompare(a.strMeal);
            return 0;
        });

    statusMessage.textContent = `Showing ${result.length} meals`;
    display(result);
}

function toggleFavourite(id, btn) {
    if (favourites.includes(id)) {
        favourites = favourites.filter(x => x !== id);
        btn.textContent = "🤍 Favourite";
        btn.classList.remove("active");
    } else {
        favourites.push(id);
        btn.textContent = "❤️ Saved";
        btn.classList.add("active");
    }

    localStorage.setItem("favourites", JSON.stringify(favourites));
}

function initTheme() {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
    }
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const dark = document.body.classList.contains("dark");
    themeToggle.textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode";

    localStorage.setItem("theme", dark ? "dark" : "light");
});

searchInput.addEventListener("input", debounce(applyFilters, 300));
categoryFilter.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);

app.addEventListener("click", e => {
    const card = e.target.closest(".card");
    const btn = e.target.closest(".fav-btn");

    if (btn) {
        toggleFavourite(btn.dataset.id, btn);
        return;
    }

    if (card) {
        showDetail(card.dataset.id);
    }
});

async function showDetail(id) {
    showSpinner();

    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    const meal = data.meals[0];

    hideSpinner();

    app.innerHTML = `
        <div class="detail-page">
            <button onclick="init()">← Back</button>
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" class="detail-img"/>
            <p>${meal.strInstructions}</p>
        </div>
    `;
}

async function init() {
    statusMessage.textContent = "Fetching recipes... this may take a few seconds";
    showSpinner();

    await fetchAllMeals();

    hideSpinner();
    populateCategories();
    applyFilters();
}

initTheme();
init();