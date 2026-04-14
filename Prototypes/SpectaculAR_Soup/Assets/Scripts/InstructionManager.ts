import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import { ConfirmPosition } from "./ConfirmPosition"

@component
export class InstructionManager extends BaseScriptComponent {

    @input
    public instructionArray : string[]

    @input
    public instructionStringHolderObject : Text

    @input
    public objectsToDisable : SceneObject[]

    @input
    public objectsToEnable : SceneObject[]

    @input
    confirmPositionObject: SceneObject
    private confirmPositionSyncEntity: SyncEntity

    private currentInstruction: number = 0

    onAwake() {
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        this.confirmPositionSyncEntity = SyncEntity.getSyncEntityOnSceneObject(this.confirmPositionObject)
        const totalPlayers = SessionController.getInstance().getUsers().length

        // Set total player count in the ConfirmPosition script
        const confirmPositionScript = this.confirmPositionObject.getComponent(
            ConfirmPosition.getTypeName()
        ) as ConfirmPosition
        if (confirmPositionScript) confirmPositionScript.totalPlayers = totalPlayers


        // Bind function to check if all players are ready after setting total player count
        this.confirmPositionSyncEntity.onEventReceived.add("checkAllPlayersReady", () => {
            confirmPositionScript.checkAllPlayersReady()
        })
    }

    public nextInstruction() {
        this.currentInstruction += 1

        if (this.currentInstruction >= this.instructionArray.length) {
            this.objectsToEnable.forEach((obj) => obj.enabled = true)
            this.objectsToDisable.forEach((obj) => obj.enabled = false)
            
            // Send events indicating that a player is ready
            this.confirmPositionSyncEntity.sendEvent("playerIsReady", {})
            this.confirmPositionSyncEntity.sendEvent("checkAllPlayersReady", {})
        } else {
            this.instructionStringHolderObject.text= this.instructionArray[this.currentInstruction]
        }
    }
}
