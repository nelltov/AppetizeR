import { IngredientInfo, IngredientType } from "./Ingredients/Ingredient";

export type Recipes = [string, IngredientInfo[]] 

const soupRecipe0: IngredientInfo[] = [
    new IngredientInfo(IngredientType.Tofu),
    new IngredientInfo(IngredientType.Pasta),
    new IngredientInfo(IngredientType.Mushroom),
    new IngredientInfo(IngredientType.Onion),
    new IngredientInfo(IngredientType.Bacon),
    new IngredientInfo(IngredientType.Celery),
    new IngredientInfo(IngredientType.Spinach)
]

const soupRecipe1: IngredientInfo[] = [
    new IngredientInfo(IngredientType.Onion),
    new IngredientInfo(IngredientType.Celery),
    new IngredientInfo(IngredientType.Chicken),
    new IngredientInfo(IngredientType.Carrot),
    new IngredientInfo(IngredientType.Potato),
    new IngredientInfo(IngredientType.Bayleaf),
    new IngredientInfo(IngredientType.Pasta)
]

const pizzaRecipe0: IngredientInfo[] = [
    new IngredientInfo(IngredientType.Bacon),
    new IngredientInfo(IngredientType.Mushroom),
    new IngredientInfo(IngredientType.Onion), 
    new IngredientInfo(IngredientType.Spinach),
    new IngredientInfo(IngredientType.Tomato),
    new IngredientInfo(IngredientType.Chicken)
]

export const soupRecipeDictionary: Record<string, IngredientInfo[]> = {
    "Auntie's Spicy Bisque": soupRecipe0,
    "Grandma's Secret Soup": soupRecipe1
}

export const pizzaRecipeDictionary: Record<string, IngredientInfo[]> = {
    "AppetizeR Special": pizzaRecipe0
}