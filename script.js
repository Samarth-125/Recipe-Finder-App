const app=document.getElementById("app")
const search=document.getElementById("search")
const sort=document.getElementById("sort")
let allMeals=[]
const display=(meals)=>{
    app.innerHTML=meals.map(meal=>`
        <h3>${meal.strMeal}</h3>
        <img src="${meal.strMealThumb}" width="200"/>
    `).join("")
}

async function getData(){
    try{
        const res=await fetch("https://www.themealdb.com/api/json/v1/1/search.php?f=a")
        const data=await res.json()
        allMeals=data.meals||[]
        display(allMeals)
    }
    catch(error){
        app.innerText="Error"
    }
}

search.addEventListener("input",()=>{
    let filtered=allMeals.filter(meal=>
        meal.strMeal.toLowerCase().includes(search.value.toLowerCase())
    )

    if(sort.value==="az"){
        filtered.sort((a,b)=>a.strMeal.localeCompare(b.strMeal))
    }
    else if(sort.value==="za"){
        filtered.sort((a,b)=>b.strMeal.localeCompare(a.strMeal))
    }

    display(filtered)
})

sort.addEventListener("change",()=>{
    let filtered=[...allMeals]

    if(search.value){
        filtered=filtered.filter(meal=>
            meal.strMeal.toLowerCase().includes(search.value.toLowerCase())
        )
    }

    if(sort.value==="az"){
        filtered.sort((a,b)=>a.strMeal.localeCompare(b.strMeal))
    }
    else if(sort.value==="za"){
        filtered.sort((a,b)=>b.strMeal.localeCompare(a.strMeal))
    }

    display(filtered)
})

getData()