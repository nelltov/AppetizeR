import { EventManager } from "./EventManager"
import { IngredientInfo } from "./Ingredients/Ingredient"

@component
export class RecipeInstructionUIController extends BaseScriptComponent {
    @input
    ingredientMaterials: Material[]

    // Cover portion
    @input
    chefCoverObject: SceneObject
    @input
    nonChefCoverObject: SceneObject

    // Ingredient portion
    @input
    apprenticeInstructions: SceneObject
    @input
    ingredientParentObject: SceneObject
    @input
    topInstructionTextPanel: Text
    @input
    ingredientNameTextPanel: Text
    @input
    ingredientIcon: Image

    // Check soup portion
    @input
    chefCheckSoupObject: SceneObject

    // Results
    @input
    victoryObject: SceneObject
    @input
    lossObject: SceneObject

    // Per-round information
    private isChef: boolean | null = null
    private currentRecipeIngredients: IngredientInfo[] = []
    

    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        this.resetUIForNewRound()

        EventManager.SpawnChefInstructions.add((recipeIngredients: IngredientInfo[]) => {
            this.showChefCover(recipeIngredients)
        })

        EventManager.SpawnPlayerIngredients.add((_: number[]) => {
            this.showApprenticeInstructions()
        })
        
        EventManager.ResetGameNetworkEvent.add(() => {
            this.resetUIForNewRound()
        })
    }

    private showChefCover(recipeIngredients: IngredientInfo[]) {
        this.clearOutIngredientUI()
        this.setObjectVisibility(this.chefCoverObject, true)
        this.isChef = true
        this.currentRecipeIngredients = recipeIngredients
    }

    private showApprenticeInstructions() {
        this.clearOutIngredientUI()
        this.setObjectVisibility(this.apprenticeInstructions, true)
        this.isChef = false
    }

    private resetUIForNewRound() {
        this.clearOutIngredientUI()
        this.isChef = null
        this.currentRecipeIngredients = []
    }

    private clearOutIngredientUI() {
        this.setObjectVisibility(this.nonChefCoverObject, false)
        this.setObjectVisibility(this.chefCoverObject, false)
        this.setObjectVisibility(this.apprenticeInstructions, false)
        this.setObjectVisibility(this.ingredientParentObject, false)
        this.setObjectVisibility(this.chefCheckSoupObject, false)
        this.setObjectVisibility(this.victoryObject, false)
        this.setObjectVisibility(this.lossObject, false)
    }

    private setObjectVisibility(object: SceneObject, isVisible: boolean) {
        if (object) {
            object.enabled = isVisible
        }
    }
}
