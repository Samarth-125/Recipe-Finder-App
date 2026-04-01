const container = document.getElementById("container");
const loading = document.getElementById("loading");

const fetchMeals = async () => {
    try {
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?f=a");
        const data = await res.json();

    loading.style.display = "none";
    const meals = data.meals || [];
    meals.forEach((meal) => {
        const div = document.createElement("div");
        div.className = "card";

    div.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
        <h3>${meal.strMeal}</h3>
        <p>${meal.strArea}</p>
    `;

    container.appendChild(div);
    });

} catch (error) {
    loading.innerText = "Error loading data";
}
};

fetchMeals();