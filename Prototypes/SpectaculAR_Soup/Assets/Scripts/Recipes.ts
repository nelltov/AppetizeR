import { getEnumMember, getEnumMemberName, IngredientCategory } from "./Ingredients/IngredientTypes";
import { IngredientInfo } from "./Ingredients/Ingredient";

export type Recipes = [string, IngredientInfo[]] 

export const Recipe0 : IngredientInfo[] = [
    new IngredientInfo(0,1),    //Chicken
    new IngredientInfo(5,0),    //Noodles
    new IngredientInfo(1,2),    //Carrot
    new IngredientInfo(1,1),    //Onion
    new IngredientInfo(1,0),    //Potatoe
    new IngredientInfo(1,7),    //Celery
    new IngredientInfo(4,6)     //Bayleaf
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

export const DebugRecipe : IngredientInfo[] = [
    new IngredientInfo(1,1),    //Onion

]

export const ourRecipes : Recipes[] = [
    ["BeefStew", Recipe0],
    ["Chicken Noodle", Recipe1],
    ["DebugRecipe", DebugRecipe]
]