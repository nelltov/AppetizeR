import { Element } from "SpectaclesUIKit.lspkg/Scripts/Components/Element"
import { Callback, createCallbacks } from "SpectaclesUIKit.lspkg/Scripts/Utility/SceneUtilities"

@component
export class CustomButton extends Element {
    @input
    @label("On Trigger Start Callbacks")
    private triggerStartCallbacks: Callback[] = []

    protected setUpEventCallbacks(): void {
        super.setUpEventCallbacks()
        
        // Add custom callbacks to the interactable events
        if (this.triggerStartCallbacks.length > 0) {
            this.interactable.onTriggerStart.add(createCallbacks(this.triggerStartCallbacks))
        }
    }
}
