import { IngredientInfo, IngredientType } from "./Ingredient"

export function distributeIngredients(recipe: IngredientInfo[], numPlayers: number): number[][] {
    let allIngredientOptions : number[] = shuffle(Object.values(IngredientType)).filter(value => typeof value === "number") as number[]
    let recipeIngredients : number[] = shuffle(recipe.map(ingredientInfo => ingredientInfo.ingredient))
    let nonRecipeIngredients : number[] = shuffle(allIngredientOptions).filter(ingredient => {
        return !recipeIngredients.some(recipeIngredient => recipeIngredient === ingredient)
    })

    const numPlates = 6
    const platesToPopulate = numPlayers * numPlates

    // First prioritize recipe ingredients, then all the unique ingredients
    let ingredientsToDistribute = recipeIngredients.concat(nonRecipeIngredients).slice(0, platesToPopulate)

    // If there are extra empty plates, keep adding ingredients (including duplicates) until all plates are filled
    while (ingredientsToDistribute.length < platesToPopulate) {
        ingredientsToDistribute = ingredientsToDistribute.concat(allIngredientOptions).slice(0, platesToPopulate)
    }

    // Give out ingredients in round-robin fashion
    let result : number[][] = []
    for (let i = 0; i < numPlayers; i++) {
        let playerIngredients = []
        for (let j = 0; j < numPlates; j++) {
            playerIngredients.push(ingredientsToDistribute[j * numPlayers + i])
        }
        result.push(playerIngredients)
    }

    print("Distribution Result: " + JSON.stringify(result))
    return result
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice(); // keep original immutable if needed
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}