import { getEnumMember, getEnumMemberName, IngredientCategory } from "./Ingredients/IngredientTypes";
import { IngredientInfo } from "./Ingredients/Ingredient";

export type Recipes = [string, IngredientInfo[]] 

export const Recipe0 : IngredientInfo[] = [
    new IngredientInfo(1,1),    //Onion1
    new IngredientInfo(1,11),   //Garlic1
    new IngredientInfo(0,0),    //Beef
    new IngredientInfo(3,3),    //RedWine
    new IngredientInfo(1,6),    //Tomato1
    new IngredientInfo(1,2),    //Carrot1
    new IngredientInfo(4,1)     //Rosemary
]

export const Recipe1 : IngredientInfo[] = [
    new IngredientInfo(1,1),    //Onion
    new IngredientInfo(1,7),    //Celery
    new IngredientInfo(0,1),    //Chicken
    new IngredientInfo(1,2),    //Carrot
    new IngredientInfo(1,0),    //Potatoe
    new IngredientInfo(4,6),    //Bay Leaf
    new IngredientInfo(5,0)     //Noodles
]

export const ourRecipes : Recipes[] = [
    ["BeefStew", Recipe0],
    ["Chicken Noodle", Recipe1]
]