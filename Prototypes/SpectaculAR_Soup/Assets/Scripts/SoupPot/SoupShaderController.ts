import { EventManager } from "Scripts/EventManager"
import { IngredientInfo } from "Scripts/Ingredients/Ingredient"

@component
export class SoupShaderController extends BaseScriptComponent {
    @input
    private soupDebugText: Text

    @input
    private debugTextPanel: Text

    @input
    private soupSurfaceObject: SceneObject
    private soupSurfaceMaterial: Material
    private soupSurfaceShader: Pass

    @input
    private soupIngredientsObject: SceneObject
    private soupIngredientsMaterial: Material
    private soupIngredientsShader: Pass
    private ingredientList: Float32Array

     onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    // ingredient_list

    onStart() {
        // Rotation of soup
        this.soupSurfaceMaterial = this.soupSurfaceObject.getComponent("Component.RenderMeshVisual").getMaterial(0)
        this.soupSurfaceShader = this.soupSurfaceMaterial.mainPass
        this.soupSurfaceShader.swirlAmount = 0

        EventManager.UpdateSoupSwirlAmount.add((swirlAmount: number) => {
            this.soupSurfaceShader.swirlAmount = swirlAmount
        })

        // Ingredients being added to the soup
        this.soupIngredientsMaterial = this.soupIngredientsObject.getComponent("Component.RenderMeshVisual").getMaterial(0)
        this.soupIngredientsShader = this.soupIngredientsMaterial.mainPass
        this.ingredientList = this.soupIngredientsShader.ingredient_list as Float32Array
        
        // Set all ingredient values to 0
        for (let i = 0; i < this.ingredientList.length; i++) {
            this.ingredientList[i] = 0.0
        }

        this.soupIngredientsShader.ingredient_list = this.ingredientList;

        EventManager.SoupPotIngredientCollisionNetworkEvent.add((ingredientInfo: IngredientInfo) => {
            print(`Ingredient collided with pot: ${ingredientInfo.variantName}`)
            
            if (this.debugTextPanel) {
                this.debugTextPanel.text = this.debugTextPanel.text + `\nNetwork Event: ${ingredientInfo.variantName} collided with pot`
            }
            if (this.soupDebugText) {
                this.soupDebugText.text = `${ingredientInfo.variantName} has been added to the soup`
            }

            const shaderIndex = ingredientInfo.ingredient
            if (shaderIndex !== undefined && shaderIndex >= 0 && shaderIndex < this.ingredientList.length) {
                this.ingredientList[shaderIndex] = 1.0
                this.soupIngredientsShader.ingredient_list = this.ingredientList; 
            }
        })
    }
}
