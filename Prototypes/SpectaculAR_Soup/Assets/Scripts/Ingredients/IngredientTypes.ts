export enum IngredientCategory {
    Meat = 0,
    Vegetable = 1,
    Spice = 2,
    Broth = 3,
    Greens = 4,
    Carbs = 5,
}

export enum MeatType {
    Beef = 0,
    Chicken = 1,
    Bacon = 2,
    Shrimp = 3,
    Tofu = 4,
    
}

export enum VegetableType {
    Potato = 0,
    Onion = 1,
    Carrot = 2,
    Beet = 3,
    Ginger = 4,
    Corn = 5,
    Tomato = 6,
    Celery = 7,
    Mushroom = 8,
    Cucumber = 9,
    SoyBeans = 10,
    Garlic = 11,
    Leek = 12,
    Taro = 13,
    Pumpkin = 14,
    RedBeans = 15
}

export enum SpiceType {
    LemonZest = 0,
    Pepper = 1,
    Oregano = 2,
    Paprika = 3,
    Thyme = 4,
    Basil = 5,
}

export enum BrothType {
    HeavyCream = 0,
    TomatoPaste = 1,
    LimeJuice = 2,
    RedWine = 3,
    CoconutMilk = 4,
    ChickenBroth = 5
}

export enum GreensType {
    Spinach = 0,
    RoseMary = 1,
    Cabbage = 2,
    Kale = 3,
    Cilantro = 4,
    Chard = 5,
    Bayleaf = 6,
}

export enum CarbsType {
    Noodles = 0,
    Ramen = 1,
}

/**
 * Helper functions for mapping from categories to subtypes
 */
// Map from IngredientCategory -> corresponding enum object
export interface CategoryEnumValueMap {
    [IngredientCategory.Meat]: MeatType;
    [IngredientCategory.Vegetable]: VegetableType;
    [IngredientCategory.Spice]: SpiceType;
    [IngredientCategory.Broth]: BrothType;
    [IngredientCategory.Greens]: GreensType;
    [IngredientCategory.Carbs]: CarbsType;
}

export const CategoryToEnum: { [K in keyof CategoryEnumValueMap]: any } = {
    [IngredientCategory.Meat]: MeatType,
    [IngredientCategory.Vegetable]: VegetableType,
    [IngredientCategory.Spice]: SpiceType,
    [IngredientCategory.Broth]: BrothType,
    [IngredientCategory.Greens]: GreensType,
    [IngredientCategory.Carbs]: CarbsType,
};

/**
 * Return the enum numeric member for a (categoryNumber, subNumber) pair.
 * Example: (0, 1) -> MeatType.Chicken (numeric 1)
 */
export function getEnumMember<K extends IngredientCategory>(categoryNumber: K, subNumber: number): CategoryEnumValueMap[K] | undefined {
    const e = CategoryToEnum[categoryNumber as any];
    if (!e) return undefined;
    // TypeScript enums compile to objects with reverse mapping: e[subNumber] -> name (string) when valid
    const name = (e as any)[subNumber];
    if (typeof name === 'string') {
        return ((e as any)[name] as unknown) as CategoryEnumValueMap[K];
    }
    return undefined;
}

/**
 * Return the enum member name for a (categoryNumber, subNumber) pair.
 * Example: (0,1) -> "Chicken"
 */
export function getEnumMemberName(categoryNumber: number, subNumber: number): string | undefined {
    const e = CategoryToEnum[categoryNumber];
    if (!e) return undefined;
    const name = (e as any)[subNumber];
    return typeof name === 'string' ? name : undefined;
}

// export const INGREDIENT_SHADER_INDEX: { [key: string]: number } = {
//     [`${IngredientCategory.Meat}_${MeatType.Bacon}`]:              0,  // Bacon
//     [`${IngredientCategory.Greens}_${GreensType.Bayleaf}`]:        1,  // Bayleaf
//     [`${IngredientCategory.Meat}_${MeatType.Beef}`]:               2,  // Beef
//     [`${IngredientCategory.Vegetable}_${VegetableType.Carrot}`]:   3,  // Carrot
//     [`${IngredientCategory.Vegetable}_${VegetableType.Celery}`]:   4,  // Celery
//     [`${IngredientCategory.Meat}_${MeatType.Chicken}`]:            5,  // Chicken
//     [`${IngredientCategory.Vegetable}_${VegetableType.Corn}`]:     6,  // Corn
//     [`${IngredientCategory.Vegetable}_${VegetableType.Leek}`]:     7,  // Leek
//     [`${IngredientCategory.Vegetable}_${VegetableType.Mushroom}`]: 8,  // Mushroom
//     [`${IngredientCategory.Carbs}_${CarbsType.Noodles}`]:          9,  // Noodle
//     [`${IngredientCategory.Vegetable}_${VegetableType.Onion}`]:    10, // Onion
//     [`${IngredientCategory.Vegetable}_${VegetableType.Potato}`]:   11, // Potatoes
//     [`${IngredientCategory.Carbs}_${CarbsType.Ramen}`]:            12, // Ramen
//     [`${IngredientCategory.Greens}_${GreensType.Spinach}`]:        13, // Spinach
//     [`${IngredientCategory.Meat}_${MeatType.Tofu}`]:               14, // Tofu
// };

// export function getIngredientShaderIndex(category: IngredientCategory, variantId: number): number {
//     return INGREDIENT_SHADER_INDEX[`${category}_${variantId}`] ?? -1;
// }