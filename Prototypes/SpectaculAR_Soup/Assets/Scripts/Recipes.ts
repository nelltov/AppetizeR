import { IngredientType } from "./Ingredients/IngredientTypes";
import { IngredientInfo } from "./Ingredients/Ingredient";

export type Recipes = [string, IngredientInfo[]] 

export const Recipe0 : IngredientInfo[] = [
    new IngredientInfo(IngredientType.Chicken),
    new IngredientInfo(IngredientType.Noodles),
    new IngredientInfo(IngredientType.Carrot),
    new IngredientInfo(IngredientType.Onion),
    new IngredientInfo(IngredientType.Potato),
    new IngredientInfo(IngredientType.Celery),
    new IngredientInfo(IngredientType.Bayleaf)
]

export const Recipe1 : IngredientInfo[] = [
    new IngredientInfo(IngredientType.Onion),
    new IngredientInfo(IngredientType.Celery),
    new IngredientInfo(IngredientType.Chicken),
    new IngredientInfo(IngredientType.Carrot),
    new IngredientInfo(IngredientType.Potato),
    new IngredientInfo(IngredientType.Bayleaf),
    new IngredientInfo(IngredientType.Noodles)
]

export const DebugRecipe : IngredientInfo[] = [
    new IngredientInfo(IngredientType.Onion)
]

export const recipeDictionary: Record<string, IngredientInfo[]> = {
    "BeefStew": Recipe0,
    "Chicken Noodle": Recipe1,
    "DebugRecipe": DebugRecipe
}

export const ourRecipes : Recipes[] = [
    ["BeefStew", Recipe0],
    ["Chicken Noodle", Recipe1],
    ["DebugRecipe", DebugRecipe]
]