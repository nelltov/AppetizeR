import { EventManager } from "../EventManager"
import { IngredientInfo } from "../Ingredients/Ingredient"

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
    private currentIngredientIndex: number = -1
    

    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        this.resetUIForNewRound()

        EventManager.SpawnChefInstructions.add((recipeIngredients: IngredientInfo[]) => {
            this.showChefCover(recipeIngredients)
            this.isChef = true
        })

        EventManager.SpawnPlayerIngredients.add((_: number[]) => {
            this.showApprenticeInstructions()
            this.isChef = false
        })

        EventManager.NextInstructionNetworkEvent.add(() => {
            if (this.isChef == null) return
            if (this.isChef) {
                this.showChefCurrentIngredient(this.currentIngredientIndex)
            } else {
                this.showApprenticeInstructions()   // Reset all apprentices to the instruction screen
            }
        })

        EventManager.SoupPotIngredientCollisionLocalEvent.add((ingredientInfo: IngredientInfo) => {
            if (this.isChef == null || this.isChef) return  // only the non-chef player that saw the collision should process it
            this.showChosenIngredient(ingredientInfo)
        })

        EventManager.CheckSoupNetworkEvent.add(() => {
            if (this.isChef == null) return
            this.showCheckSoup()
        })

        EventManager.PlayerVictoryNetworkEvent.add((isVictory: boolean) => {
            this.showResults(isVictory)
        })
        
        EventManager.ResetGameNetworkEvent.add(() => {
            this.resetUIForNewRound()
        })
    }

    public nextInstruction() {
        if (this.isChef == null || !this.isChef || this.currentIngredientIndex >= this.currentRecipeIngredients.length) {
            return
        }

        // Just increment the index and call local events, network event will handle switching the UI to the next instruction
        this.currentIngredientIndex++
        if (this.currentIngredientIndex === this.currentRecipeIngredients.length) {
            EventManager.CheckSoupLocalEvent.trigger()
        } else {  // still have more instructions to go through
            EventManager.NextInstructionLocalEvent.trigger()
        }
    }

    private showChefCover(recipeIngredients: IngredientInfo[]) {
        this.clearOutIngredientUI()
        this.setObjectVisibility(this.chefCoverObject, true)
        this.currentRecipeIngredients = recipeIngredients
    }

    private showApprenticeInstructions() {
        this.clearOutIngredientUI()
        this.setObjectVisibility(this.apprenticeInstructions, true)
    }

    private showChefCurrentIngredient(currentIndex: number) {
        if (this.isChef == null || !this.isChef || currentIndex >= this.currentRecipeIngredients.length) return

        this.clearOutIngredientUI()

        let currentIngredientInfo = this.currentRecipeIngredients[currentIndex]

        this.topInstructionTextPanel.text = "Use One Word to Describe:"
        this.ingredientNameTextPanel.text = currentIngredientInfo.getIngredientName()

        let currentMaterial = this.ingredientMaterials[currentIngredientInfo.getIngredientType()]
        if (currentMaterial) this.ingredientIcon.materials = [currentMaterial]

        this.setObjectVisibility(this.ingredientParentObject, true)
    }

    private showChosenIngredient(ingredientInfo: IngredientInfo) {
        if (this.isChef == null || this.isChef) return

        this.clearOutIngredientUI()

        this.topInstructionTextPanel.text = "Chosen Ingredient"
        this.ingredientNameTextPanel.text = ingredientInfo.getIngredientName()

        let currentMaterial = this.ingredientMaterials[ingredientInfo.getIngredientType()]
        if (currentMaterial) this.ingredientIcon.materials = [currentMaterial]

        this.setObjectVisibility(this.ingredientParentObject, true)
    }

    private showCheckSoup() {
        this.clearOutIngredientUI()
        this.setObjectVisibility(this.chefCheckSoupObject, true)
    }

    private showResults(isVictory: boolean) {
        this.clearOutIngredientUI()
        this.setObjectVisibility(this.victoryObject, isVictory)
        this.setObjectVisibility(this.lossObject, !isVictory)
    }

    private resetUIForNewRound() {
        this.clearOutIngredientUI()
        this.isChef = null
        this.currentRecipeIngredients = []
        this.currentIngredientIndex = -1
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
