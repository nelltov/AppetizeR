import { IngredientInfo, IngredientType } from "./Ingredients/Ingredient";

export type Recipes = [string, IngredientInfo[]] 

export const Recipe0 : IngredientInfo[] = [
    new IngredientInfo(IngredientType.Tofu),
    new IngredientInfo(IngredientType.Noodles),
    new IngredientInfo(IngredientType.Mushroom),
    new IngredientInfo(IngredientType.Onion),
    new IngredientInfo(IngredientType.Leek),
    new IngredientInfo(IngredientType.Celery),
    new IngredientInfo(IngredientType.Spinach)
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

export const StarterRecipe : IngredientInfo[] = [
    new IngredientInfo(IngredientType.Carrot),
    new IngredientInfo(IngredientType.Chicken),
    new IngredientInfo(IngredientType.Noodles),
  
]

export const recipeDictionary: Record<string, IngredientInfo[]> = {
    "Beef Stew": Recipe0,
    "Chicken Noodle": Recipe1,
    "Starter Recipe": StarterRecipe
}

export const ourRecipes : Recipes[] = [
    ["Beef Stew", Recipe0],
    ["Chicken Noodle", Recipe1],
    ["Starter Recipe", StarterRecipe]
]