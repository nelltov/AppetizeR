import { BillboardToCamera } from "./BillboardToCamera"
import { EventManager } from "./EventManager"
import { InteractableManipulation } from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation"
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity"

@component
export class ConfirmPosition extends BaseScriptComponent {
    private syncEntity: SyncEntity
    private playersReady: number
    public totalPlayers: number

    @input
    confirmButton: SceneObject

    @input
    startingObject: SceneObject
    private startObjectInteractableManipulation: InteractableManipulation

    @input
    gameRoot: SceneObject

    @input
    billboardScript: BillboardToCamera

    // Objects to enable when player clicks the confirm button
    @input
    public disableOnConfirm : SceneObject[]

    @input
    public enableOnConfirm : SceneObject[]

    // Objects to enable when all players are ready
    @input
    public disableOnAllReady : SceneObject[]

    @input
    public enableOnAllReady : SceneObject[]

    onAwake() {
        this.syncEntity = new SyncEntity(this);
        this.syncEntity.notifyOnReady(() => this.onReady())
    }

    onReady() {
        this.startObjectInteractableManipulation = this.startingObject.getComponent(InteractableManipulation.getTypeName()) as InteractableManipulation

        this.playersReady = 0
        this.syncEntity.onEventReceived.add("playerIsReady", () => {
            this.playersReady += 1
        })
    }

    /* This function is attached to sync event by PlayersReady script */
    public checkAllPlayersReady() {
        if (this.playersReady === this.totalPlayers) {
            this.enableOnAllReady.forEach((obj) => obj.enabled = true)
            this.disableOnAllReady.forEach((obj) => obj.enabled = false)

            EventManager.CenterPositionSetLocal.trigger(this.gameRoot.getTransform().getWorldPosition())
        }
    }

    /* Lock position and deactivate button for each individual player */
    public confirmGamePosition() {
        this.startObjectInteractableManipulation.enabled = false
        this.enableOnConfirm.forEach((obj) => obj.enabled = true)
        this.disableOnConfirm.forEach((obj) => obj.enabled = false)
    }

    /* Stop automatic rotation of the starting objects */
    public stopBillboard() {
        if (this.billboardScript) this.billboardScript.enabled = false
    }
}
