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