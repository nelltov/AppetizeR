@component
export class RecipeInstructionUIController extends BaseScriptComponent {
    @input
    ingredientMaterials: Material[]

    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        // TODO
    }
}
