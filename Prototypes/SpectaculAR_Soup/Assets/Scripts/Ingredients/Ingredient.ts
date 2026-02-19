import { getEnumMember, getEnumMemberName, IngredientCategory } from "./IngredientTypes";
export type IngredientInfo = {
    category: IngredientCategory
    variantId: number // The actual choice within our IngredientCategory
    variantName: string
}

@component
export class Ingredient extends BaseScriptComponent {
    @input
    public categoryNumber: number = 0

    @input
    public variantId: number = 0

    public getIngredientInfo(): IngredientInfo {
        return {
            category: this.categoryNumber as IngredientCategory,
            variantId: this.variantId,
            variantName: this.getVariantName()
        }
    }

    protected getVariantName(): string {
        return getEnumMemberName(this.categoryNumber, this.variantId) ?? "Unknown Ingredient"
    }

    onAwake() {
        // Debug print message to verify that the correct subcategory was chosen
        // print(`Ingredient awake. In category ${this.categoryNumber}, and variant #${this.variantId} (${this.getVariantName()})`)
    }
}
