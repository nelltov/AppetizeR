import { Element } from "SpectaclesUIKit.lspkg/Scripts/Components/Element"
import { Callback, createCallbacks } from "SpectaclesUIKit.lspkg/Scripts/Utility/SceneUtilities"
import { InteractorEvent } from "SpectaclesInteractionKit.lspkg/Core/Interactor/InteractorEvent"

@component
export class CustomButton extends Element {
    @input
    @label("On Trigger Start Callbacks")
    private triggerStartCallbacks: Callback[] = []

    @input
    @hint("Minimum time between button triggers (in seconds)")
    private cooldownDuration: number = 0.5

    private lastTriggerTime: number = 0

    // Handle button cooldown and custom callback functions
    protected onTriggerDownHandler(event: InteractorEvent) {
        const currentTime = getTime()
        
        if (currentTime - this.lastTriggerTime < this.cooldownDuration) {
            return 
        }
        
        // Update last trigger time
        this.lastTriggerTime = currentTime
        
        // Execute custom callbacks
        if (this.triggerStartCallbacks.length > 0) {
            const combinedCallback = createCallbacks(this.triggerStartCallbacks)
            combinedCallback(event)
        }
        
        // Normal trigger behavior
        super.onTriggerDownHandler(event)
    }

    // Prevent trigger up sound during cooldown
    protected onTriggerUpHandler(event: InteractorEvent) {
        const currentTime = getTime()
        
        // If we're still in cooldown from the last trigger, skip the sound
        if (currentTime - this.lastTriggerTime < this.cooldownDuration) {
            return
        }
        
        // Normal trigger up behavior
        super.onTriggerUpHandler(event)
    }
}
