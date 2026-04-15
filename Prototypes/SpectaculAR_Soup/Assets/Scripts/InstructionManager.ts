import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import { ConfirmPosition } from "./ConfirmPosition"
import { EventManager } from "./EventManager"

@component
export class InstructionManager extends BaseScriptComponent {

    @input
    public instructionArray : string[]

    @input
    public instructionStringHolderObject : Text

    private currentInstruction: number = 0

    public nextInstruction() {
        this.currentInstruction += 1

        if (this.currentInstruction >= this.instructionArray.length) {
            // Send events indicating that a player is ready
            EventManager.PlayerReadyEvent.trigger()
        } else {
            this.instructionStringHolderObject.text= this.instructionArray[this.currentInstruction]
        }
    }
}
