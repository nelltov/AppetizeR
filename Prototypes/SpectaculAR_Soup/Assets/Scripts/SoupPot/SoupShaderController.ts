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

     onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        // Rotation of soup
        this.soupSurfaceMaterial = this.soupSurfaceObject.getComponent("Component.RenderMeshVisual").getMaterial(0)
        this.soupSurfaceShader = this.soupSurfaceMaterial.mainPass
        this.soupSurfaceShader.swirlAmount = 0

        EventManager.UpdateSoupSwirlAmount.add((swirlAmount: number) => {
            this.soupSurfaceShader.swirlAmount = swirlAmount
        })

        // Ingredients being added to the soup
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
