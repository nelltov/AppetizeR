import { IngredientInfo } from "./Ingredient";

export function distributeIngredients(recipe: IngredientInfo[], numPlayers: number): number[][] {
    // TODO: Replace placeholder with real implementation
    let result : number[][] = []
    for (let i = 0; i < numPlayers; i++) {
        result.push(shuffle([3, 4, 7, 10, 11, 15]))
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