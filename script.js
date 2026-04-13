const app            = document.getElementById("app");
const searchInput    = document.getElementById("search");
const categoryFilter = document.getElementById("category-filter");
const sortSelect     = document.getElementById("sort");
const themeToggle    = document.getElementById("theme-toggle");
const statusMessage  = document.getElementById("status-message");
const spinner        = document.getElementById("spinner");

let allMeals   = [];
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function showSpinner() {
    if (spinner) spinner.classList.add("visible");
    app.innerHTML = "";
}

function hideSpinner() {
    if (spinner) spinner.classList.remove("visible");
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
    allMeals = results.flatMap(meals => meals);
}

function populateCategories() {
    const categories = [...new Set(allMeals.map(meal => meal.strCategory))].sort();

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

function display(meals) {
    if (meals.length === 0) {
        app.innerHTML = `<p class="no-results">No meals found. Try a different search.</p>`;
        return;
    }

    app.innerHTML = meals.map(meal => {
        const isFav = favourites.includes(meal.idMeal);

        return `
            <div class="card" onclick="showDetail('${meal.idMeal}')">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" />
                <div class="card-body">
                    <h3>${meal.strMeal}</h3>
                    <p class="category">${meal.strCategory}</p>
                    <button
                        class="fav-btn ${isFav ? "active" : ""}"
                        onclick="event.stopPropagation(); toggleFavourite('${meal.idMeal}', this)"
                    >
                        ${isFav ? "❤️ Saved" : "🤍 Favourite"}
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function applyFilters() {
    const query    = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const sortBy   = sortSelect.value;

    let result = allMeals
        .filter(meal => meal.strMeal.toLowerCase().includes(query))
        .filter(meal => category === "" || meal.strCategory === category)
        .sort((a, b) => {
            if (sortBy === "az") return a.strMeal.localeCompare(b.strMeal);
            if (sortBy === "za") return b.strMeal.localeCompare(a.strMeal);
            return 0;
        });

    statusMessage.textContent = `Showing ${result.length} meal${result.length !== 1 ? "s" : ""}`;
    display(result);
}

function toggleFavourite(mealId, btn) {
    const alreadySaved = favourites.includes(mealId);

    if (alreadySaved) {
        favourites = favourites.filter(id => id !== mealId);
        btn.textContent = "🤍 Favourite";
        btn.classList.remove("active");
    } else {
        favourites.push(mealId);
        btn.textContent = "❤️ Saved";
        btn.classList.add("active");
    }

    localStorage.setItem("favourites", JSON.stringify(favourites));
}

function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "☀️ Light Mode";
    }
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

searchInput.addEventListener("input", debounce(applyFilters, 300));
categoryFilter.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);

async function showDetail(mealId) {
    const controls      = document.querySelector(".controls");
    const statusMessage = document.getElementById("status-message");

    controls.style.display      = "none";
    statusMessage.style.display = "none";
    showSpinner();

    try {
        const res  = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
        const data = await res.json();
        const meal = data.meals[0];

        const ingredients = Array.from({ length: 20 }, (_, i) => {
            const ingredient = meal[`strIngredient${i + 1}`];
            const measure    = meal[`strMeasure${i + 1}`];
            return ingredient && ingredient.trim()
                ? `<li>${measure ? measure.trim() + " " : ""}${ingredient.trim()}</li>`
                : null;
        }).filter(Boolean).join("");

        const instructions = meal.strInstructions
            .split(". ")
            .map(step => `<p>${step.trim()}.</p>`)
            .join("");

        hideSpinner();

        app.innerHTML = `
            <div class="detail-page">
                <button class="back-btn" onclick="goBack()">← Back</button>
                <div class="detail-content">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="detail-img" />
                    <div class="detail-info">
                        <h2>${meal.strMeal}</h2>
                        <p class="detail-meta">${meal.strCategory} · ${meal.strArea}</p>

                        <h3>Ingredients</h3>
                        <ul class="ingredient-list">${ingredients}</ul>

                        <h3>Instructions</h3>
                        <div class="instructions">${instructions}</div>

                        ${meal.strYoutube ? `<a class="yt-link" href="${meal.strYoutube}" target="_blank">▶ Watch on YouTube</a>` : ""}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        hideSpinner();
        app.innerHTML = `<p class="no-results">Could not load recipe. Please try again.</p>`;
    }
}

function goBack() {
    const controls      = document.querySelector(".controls");
    const statusMessage = document.getElementById("status-message");

    controls.style.display      = "flex";
    statusMessage.style.display = "block";
    applyFilters();
}

async function init() {
    statusMessage.textContent = "Fetching recipes from A–Z...";
    showSpinner();

    try {
        await fetchAllMeals();
        hideSpinner();
        populateCategories();
        applyFilters();
    } catch (error) {
        hideSpinner();
        app.innerHTML = `<p class="no-results">Something went wrong. Please refresh the page.</p>`;
        statusMessage.textContent = "";
    }
}

initTheme();
init();