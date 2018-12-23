// js lib used to make http requests from nodejs or xmlhttprequests from a browser
import axios from 'axios';  // axios superior to fetch method
import { key } from '../config'

 export default class Search {
     constructor(query){
         this.query = query;
     }

     async getResults(query) {
        try {
            const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            
            this.result = res.data.recipes
            // console.log(this.result)
        } catch (error) {
            alert(error)
        }
    }
 }

