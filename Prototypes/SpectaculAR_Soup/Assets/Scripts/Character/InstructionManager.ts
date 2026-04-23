import { EventManager } from "../EventManager"

@component
export class InstructionManager extends BaseScriptComponent {

    @input
    public instructionArray : string[]

    @input
    public instructionStringHolderObject : Text

    private currentInstruction: number = 0

    onAwake() {
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        this.instructionStringHolderObject.lineSpacing = 0.75
    }

    public nextInstruction() {
        this.currentInstruction += 1

        if (this.currentInstruction >= this.instructionArray.length) {
            // Send events indicating that a player is ready
            EventManager.PlayerReadyEvent.trigger()
        } else {
            this.instructionStringHolderObject.text = this.instructionArray[this.currentInstruction]
        }
    }
}
