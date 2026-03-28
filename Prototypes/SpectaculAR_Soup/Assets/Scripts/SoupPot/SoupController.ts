import { EventManager } from "Scripts/EventManager"
import { IngredientInfo } from "Scripts/Ingredients/Ingredient"
//import { getIngredientShaderIndex } from "Scripts/Ingredients/IngredientTypes"

@component
export class SoupController extends BaseScriptComponent {
    @input
    private soupDebugText: Text

    @input
    private debugTextPanel: Text

    @input ingredientShaderObject: SceneObject;

    private soupMaterial: Material

    private soupShader: Pass
    
    private ingredientList: Float32Array = new Float32Array(16)

     onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        // Debug print whenever collision event triggers to verify collision and ingredient info retrieval
        // const meshVisual = this.ingredientShaderObject.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
        // this.soupMaterial = meshVisual.getMaterial(0).clone()
        // meshVisual.mainMaterial = this.soupMaterial
        // this.soupShader = this.soupMaterial.mainPass
        // this.soupShader.ingredient_list = this.ingredientList;
         EventManager.SoupPotIngredientCollisionNetworkEvent.add((ingredientInfo: IngredientInfo) => {

            print(`Ingredient collided with pot: ${ingredientInfo.variantName}`)
            
            if (this.debugTextPanel) {
                this.debugTextPanel.text = this.debugTextPanel.text + `\nNetwork Event: ${ingredientInfo.variantName} collided with pot`
            }
            if (this.soupDebugText) {
                this.soupDebugText.text = `${ingredientInfo.variantName} has been added to the soup`
                
            }
        })
    }
}
