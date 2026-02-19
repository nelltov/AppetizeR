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
    PorkMeat = 2,
    Shellfish = 3,
    Fish = 4, 
}

export enum VegetableType {
    Potato = 0,
    Onion = 1,
    Carrot = 2,
    Beet = 3,
    Ginger = 4,
    Yams = 5,
    Tomato = 6,
    Celery = 7,
    Brocoli = 8,
    Cucumber = 9,
    Beans = 10,
    Garlic = 11,
    Squash = 12,
}

export enum SpiceType {
    Salt = 0,
    Pepper = 1,
    Oregano = 2,
    Paprika = 3,
    Thyme = 4,
    Rosemary = 5,
    Basil = 6,
    Bayleaf = 7,
}

export enum BrothType {
    Cream = 0,
    Seafood = 1,
    Vegetable = 2,
    Beef = 3,
    Chicken = 4,
}

export enum GreensType {
    Spinach = 0,
    Lettuce = 1,
    Cabbage = 2,
    Kale = 3,
    CollardGreens = 4,
    Chard = 5,
    Bayleaf = 6,
}

export enum CarbsType {
    Noodles = 0,
    Rice = 1,
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