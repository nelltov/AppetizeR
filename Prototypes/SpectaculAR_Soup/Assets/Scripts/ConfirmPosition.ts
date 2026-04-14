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

    // Objects to enable when all players are ready
    @input
    public objectsToDisable : SceneObject[]

    @input
    public objectsToEnable : SceneObject[]

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

    public checkAllPlayersReady() {
        if (this.playersReady === this.totalPlayers) {
            this.objectsToEnable.forEach((obj) => obj.enabled = true)
            this.objectsToDisable.forEach((obj) => obj.enabled = false)

            EventManager.CenterPositionSetLocal.trigger(this.gameRoot.getTransform().getWorldPosition())
        }
    }

    /* Lock position and deactivate button for each individual player */
    public confirmGamePosition() {
        print("confirm game position")
        this.confirmButton.enabled = false
        this.startObjectInteractableManipulation.enabled = false
        this.gameRoot.enabled = true
    }
}
