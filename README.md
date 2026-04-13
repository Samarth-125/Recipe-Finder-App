# Recipe Finder App

Search and explore recipes from around the world.

## Description

A web application that lets users search, filter, sort, and save their favourite recipes using real-time data from TheMealDB API. Built with vanilla HTML, CSS, and JavaScript — focused on clean code, API integration, and DOM manipulation.

## Note on Commit Timing

I realized after completing some changes that I had forgotten to commit them earlier.<br>

While reviewing the project, I also noticed a small issue in data fetching and UI rendering, which I fixed and included in a later commit.<br>

Apologies for the delayed commit. You can check the previous commits to see the original development flow and milestone-wise progress.

## Features

- **Search** — Find recipes by name in real time
- **Filter by Category** — Browse meals by cuisine type (e.g. Dessert, Seafood, Vegetarian)
- **Sort A–Z / Z–A** — Alphabetically arrange results
- **Favourites** — Save and unsave meals; persisted with Local Storage
- **Dark / Light Mode** — Theme toggle with preference saved in Local Storage
- **All Recipes A–Z** — Fetches meals across all 26 letters using `Promise.all`

## API

TheMealDB (free, no key required):

```
https://www.themealdb.com/api/json/v1/1/search.php?f={letter}
```

The `?f=` parameter returns meals starting with that letter. The app loops through all 26 letters to fetch the complete recipe list.

## Tech Used

- HTML5
- CSS3 (CSS Variables, Grid, Flexbox)
- Vanilla JavaScript (ES6+, async/await, HOFs)
- TheMealDB API
- Local Storage (for favourites and theme)

## Live Demo
 
🔗 [View Deployed App](https://recipe-finder-app-nine.vercel.app)

## How to Run

1. Clone or download this repository
2. Open `index.html` in any browser
3. No build tools or dependencies needed

## Project Structure

```
├── index.html   — Page structure
├── style.css    — All styles and dark mode variables
├── script.js    — API logic, filtering, sorting, favourites
└── README.md    — Project documentation
```

## Student Details

**Name:** Samarth<br>
**Roll Number:** 2501010400
