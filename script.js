const app = document.getElementById("app")
const searchInput = document.getElementById("search")
const categoryFilter = document.getElementById("category-filter")
const sortSelect = document.getElementById("sort")
const themeToggle = document.getElementById("theme-toggle")
const statusMessage = document.getElementById("status-message")

let meals = []
let favourites = JSON.parse(localStorage.getItem("favourites")) || []

async function getMeals() {
    const letters = "abcdefghijklmnopqrstuvwxyz".split("")
    let all = []

    for (let i = 0; i < letters.length; i++) {
        try {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letters[i]}`)
            const data = await res.json()

            if (data.meals) {
                all = all.concat(data.meals)
            }
        } catch (e) {}
    }

    meals = all
}

function fillCategories() {
    const list = []

    meals.forEach(meal => {
        if (!list.includes(meal.strCategory)) {
            list.push(meal.strCategory)
        }
    })

    list.sort()

    list.forEach(cat => {
        const option = document.createElement("option")
        option.value = cat
        option.textContent = cat
        categoryFilter.appendChild(option)
    })
}

function showMeals(list) {
    if (!list.length) {
        app.innerHTML = `<p class="no-results">No meals found. Try something else.</p>`
        return
    }

    let html = ""

    list.forEach(meal => {
        const saved = favourites.includes(meal.idMeal)

        html += `
        <div class="card">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="card-body">
                <h3>${meal.strMeal}</h3>
                <p class="category">${meal.strCategory}</p>
                <button class="fav-btn ${saved ? "active" : ""}" onclick="toggleFavourite('${meal.idMeal}', this)">
                    ${saved ? "❤️ Saved" : "🤍 Favourite"}
                </button>
            </div>
        </div>
        `
    })

    app.innerHTML = html
}

function updateMeals() {
    const text = searchInput.value.toLowerCase().trim()
    const category = categoryFilter.value
    const sort = sortSelect.value

    let filtered = []

    for (let i = 0; i < meals.length; i++) {
        const meal = meals[i]

        if (!meal.strMeal.toLowerCase().includes(text)) continue
        if (category && meal.strCategory !== category) continue

        filtered.push(meal)
    }

    if (sort === "az") {
        filtered.sort((a, b) => a.strMeal.localeCompare(b.strMeal))
    } else if (sort === "za") {
        filtered.sort((a, b) => b.strMeal.localeCompare(a.strMeal))
    }

    statusMessage.textContent = `Showing ${filtered.length} meal${filtered.length === 1 ? "" : "s"}`
    showMeals(filtered)
}

function toggleFavourite(id, btn) {
    const index = favourites.indexOf(id)

    if (index !== -1) {
        favourites.splice(index, 1)
        btn.textContent = "🤍 Favourite"
        btn.classList.remove("active")
    } else {
        favourites.push(id)
        btn.textContent = "❤️ Saved"
        btn.classList.add("active")
    }

    localStorage.setItem("favourites", JSON.stringify(favourites))
}

function loadTheme() {
    const saved = localStorage.getItem("theme")

    if (saved === "dark") {
        document.body.classList.add("dark")
        themeToggle.textContent = "☀️ Light Mode"
    }
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark")

    const dark = document.body.classList.contains("dark")

    themeToggle.textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode"
    localStorage.setItem("theme", dark ? "dark" : "light")
})

searchInput.addEventListener("input", updateMeals)
categoryFilter.addEventListener("change", updateMeals)
sortSelect.addEventListener("change", updateMeals)

async function start() {
    statusMessage.textContent = "Fetching recipes..."

    try {
        await getMeals()
        fillCategories()
        updateMeals()
    } catch (e) {
        app.innerHTML = `<p class="no-results">Something went wrong</p>`
        statusMessage.textContent = ""
    }
}

loadTheme()
start()