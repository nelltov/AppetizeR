import { EventManager } from "../EventManager"
import { IngredientInfo } from "../Ingredients/Ingredient"

@component
export class SoupShaderController extends BaseScriptComponent {
    @input
    private soupSurfaceObject: SceneObject
    private soupSurfaceShader: Pass

    @input
    private soupIngredientsObject: SceneObject
    private soupIngredientsShader: Pass
    private ingredientList: Float32Array

    @input
    private soupVFX: VFXComponent;

     onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    private clearSoupIngredients() {
        // Set all ingredient values to 0
        for (let i = 0; i < this.ingredientList.length; i++) {
            this.ingredientList[i] = 0.0
        }

        this.soupIngredientsShader.ingredient_list = this.ingredientList;
    }

    onStart() {
        // Rotation of soup
        const soupSurfaceMaterial = this.soupSurfaceObject.getComponent("Component.RenderMeshVisual").getMaterial(0)
        this.soupSurfaceShader = soupSurfaceMaterial.mainPass
        this.soupSurfaceShader.swirlAmount = 0
        

        EventManager.UpdateSoupSwirlAmount.add((swirlAmount: number) => {
            this.soupSurfaceShader.swirlAmount = swirlAmount
        })

        // Ingredients being added to the soup
        const soupIngredientsMaterial = this.soupIngredientsObject.getComponent("Component.RenderMeshVisual").getMaterial(0)
        this.soupIngredientsShader = soupIngredientsMaterial.mainPass
        this.ingredientList = this.soupIngredientsShader.ingredient_list as Float32Array
        
        this.clearSoupIngredients()

        EventManager.SoupPotIngredientCollisionNetworkEvent.add((ingredientInfo: IngredientInfo) => {
            if (this.soupVFX) {
                this.soupVFX.enabled = true;
                this.soupVFX.restart();
            }
            const shaderIndex = ingredientInfo.ingredient
            if (shaderIndex !== undefined && shaderIndex >= 0 && shaderIndex < this.ingredientList.length) {
                this.ingredientList[shaderIndex] = 1.0
                this.soupIngredientsShader.ingredient_list = this.ingredientList; 
            }
        })

        // Game reset logic
        EventManager.ResetGameNetworkEvent.add(() => {
            this.clearSoupIngredients()
        })
    }
}
