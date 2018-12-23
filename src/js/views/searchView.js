import { elements } from './base';

export const getInput = () => elements.searchInput.value; // returns this value (es6 syntax more vague)

export const clearInput = () => {
    elements.searchInput.value = ''
};

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const highlightSelected = id => {        // highlights selected recipe
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');           // removes highlight from prevs selected recipe
    });
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};

/* // 'pasta with tomato and spinach' 
acc: 0 / acc + cur.length = 5 / newTitle = ['pasta']
acc: 5 / acc + cur.length = 9 / newTitle = ['pasta', 'with']
acc: 9 / acc + cur.length = 15 / newTitle = ['pasta', 'with', 'tomato']
acc: 15 / acc + cur.length = 18 / newTitle = ['pasta', 'with', 'tomato', 'and']
acc: 18 / acc + cur.length = 24 / newTitle = ['pasta', 'with', 'tomato', 'and', 'spinach']*/
export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit){
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);
        // return the result
        return `${newTitle.join(' ')} ...`
    }
    return title;
}

// adds the side html list of recipes
const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

// adds buttons to the bottom of recipe list. type: 'prev' or 'next'
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page -1 : page +1}>
        <span>Page ${type === 'prev' ? page -1 : page +1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>        
    `;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);
    let button;

    if (page === 1 && pages > 1) {
        // only Button to go to next page
        button = createButton(page, 'next')
    } else if (page < pages) {
        // both buttons
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    } else if (page === pages) {
        // only button to go to prev page
        button = createButton(page, 'prev')
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    // render results of current page
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    recipes.slice(start, end).forEach(renderRecipe);
    // render pagination buttons
    renderButtons(page, recipes.length, resPerPage)
};