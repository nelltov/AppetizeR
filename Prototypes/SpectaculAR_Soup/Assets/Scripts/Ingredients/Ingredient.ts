import { getEnumMemberName, IngredientCategory } from "./IngredientTypes";

export class IngredientInfo {
    category: IngredientCategory
    variantId: number
    variantName: string

    // Used to initialize an instance of this class by passing in the category and variant numbers
    constructor(category: IngredientCategory, variantId: number) {
        this.category = category
        this.variantId = variantId
        this.variantName = getEnumMemberName(category, variantId) ?? "Unknown Ingredient"
    }
}

@component
export class Ingredient extends BaseScriptComponent {
    @input
    public categoryNumber: number = 0

    @input
    public variantId: number = 0

    

    private ingredientInfo: IngredientInfo | null = null

    // Returns the ingredientInfo object (initializing it if not yet created)
    public getIngredientInfo(): IngredientInfo {
        if (!this.ingredientInfo) {
            this.ingredientInfo = new IngredientInfo(this.categoryNumber as IngredientCategory, this.variantId)
        }
        return this.ingredientInfo
    }

    public isSameIngredient(other: Ingredient): boolean {
        return this.categoryNumber === other.categoryNumber && this.variantId === other.variantId
    }

    protected getVariantName(): string {
        return getEnumMemberName(this.categoryNumber, this.variantId) ?? "Unknown Ingredient"
    }
}
