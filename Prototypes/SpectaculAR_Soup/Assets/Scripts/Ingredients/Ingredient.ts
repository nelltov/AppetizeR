export enum IngredientType {
    // Bacon = 0,
    Bayleaf = 1,
    // Beef = 2,
    Carrot = 3,
    Celery = 4,
    Chicken = 5,
    // Corn = 6,
    Leek = 7,
    Mushroom = 8,
    Noodles = 9,
    Onion = 10,
    Potato = 11,
    // Ramen = 12,
    Spinach = 13,
    Tofu = 14,
    Tomato = 15,
}

export class IngredientInfo {
    ingredient: IngredientType
    variantName: string

    // Used to initialize an instance of this class by passing in the category and variant numbers
    constructor(ingredientType: IngredientType) {
        this.ingredient = ingredientType
        this.variantName = IngredientType[ingredientType] ?? "Unknown Ingredient"
    }

    public isSameIngredient(other: IngredientInfo): boolean {
        return this.ingredient === other.ingredient
    }
}

@component
export class Ingredient extends BaseScriptComponent {
    @input
    public ingredientEnumNumber: number = 0

    private ingredientInfo: IngredientInfo | null = null

    onAwake() {
        this.ingredientInfo = new IngredientInfo(this.ingredientEnumNumber as IngredientType)
    }

    // Returns the ingredientInfo object (initializing it if not yet created)
    public getIngredientInfo(): IngredientInfo {
        return this.ingredientInfo
    }

    protected getVariantName(): string {
        return this.getIngredientInfo().variantName
    }
}
