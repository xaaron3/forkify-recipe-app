import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';


// global state of the app, all this data will be stored in one central variable
// -search object
// -current recipe object
// -shopping list object
// -liked recipes
const state = {}

// Search Controller
const controlSearch = async () => {     // async bc we use await down below
    // 1) get query from view
    const query = searchView.getInput()

    if (query) {
        // 2) new search object and add to state
        state.search = new Search(query)

        // 3) prepare UI for results
        searchView.clearInput();    // clears text input after submitting
        searchView.clearResults();  // clears old results b4 displaying the new
        renderLoader(elements.searchRes); // renders the loader img

        try {
            // 4) search for recipes
            // returns a promise. await until promise resolves and returns data. #5 waits for api
            await state.search.getResults() 

            // 5) render results on UI
            clearLoader();         // clear loader img b4 rendering recipes
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('something wrong with the search...')
            console.log(error)
            clearLoader();
        }
    };
};

// submit search event listener //////////////////////////////////////////////////
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();   
});

// click next page event listener //////////////////////////////////////////////////
elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);    // base 10, not sure why.
        searchView.clearResults(); 
        searchView.renderResults(state.search.result, goToPage);
    }
});



// RECIPE CONTROLLER //////////////////////////////////////////////////////////////////////////////////////
const controlRecipe = async () => {
    // get ID from url
    const id = window.location.hash.replace('#', '');

    if (id) {
        // prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        // create new recipe object
        state.recipe = new Recipe(id);

        try {
            // get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id));

        } catch (err) {
            console.log(err)
            alert('error processing')
        }
    }
};


// multiple e.listeners same f() ///////////////////////////////////////////////////
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



// LIST CONTROLLER /////////////////////////////////////////////////////////////////////
const controlList = () => {
    // create a new list IF there is none yet
    if (!state.list) state.list = new List(); // dont need to pass anything in, just init empty obj

    // add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}


// Handle delete and update list item event //////////////////////////////////////////////////
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handle the delete button and the * includes matches child elements
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // delete from state
        state.list.deleteItem(id);
        // delete from UI
        listView.deleteItem(id);

        // handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val)
    }
});



// LIKES CONTROLLER ///////////////////////////////////////////////////////////////////////
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // user has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // add liketo the state
        const newLike = state.likes.addLike(
            currentID, 
            state.recipe.title, 
            state.recipe.author, 
            state.recipe.img
        );
        // toggle the like button
        likesView.toggleLikeBtn(true);

        // add like to UI list
        likesView.renderLike(newLike);
        

    // user HAS liked
    } else {
        // remove like from the state
        state.likes.deleteLike(currentID);

        // toggle the like button
        likesView.toggleLikeBtn(false);

        // remove like from UI list
        likesView.deleteLike(currentID)
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


// RESTORE LIKED RECIPES ON PAGE LOAD /////////////////////////////////////////////////////
window.addEventListener('load', () => {
    state.likes = new Likes();      // (empty after a page reload)
    state.likes.readStorage();      // fill it from storage
    likesView.toggleLikeMenu(state.likes.getNumLikes());    // toggle like menu button
    state.likes.likes.forEach(like => likesView.renderLike(like)) // render the existing likes
});



// Handling recipe button clicks /////////////////////////////////////////////////////////
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
            // decrease button is clicked
            if (state.recipe.servings > 1) {        // bc cant go lower than 1
                state.recipe.updateServings('dec');
                recipeView.updateServingsIngredients(state.recipe);
                }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // LIKE controller
        controlLike();
    }
});


