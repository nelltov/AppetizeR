import { EventManager } from "Scripts/EventManager"
import { IngredientInfo } from "Scripts/Ingredients/Ingredient"

@component
export class SoupMarkerController extends BaseScriptComponent {
    @input
    private soupDebugText: Text

    @input
    private debugTextPanel: Text

     onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
         // Debug print whenever collision event triggers to verify collision and ingredient info retrieval
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
