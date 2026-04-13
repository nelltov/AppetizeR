import { EventManager } from "./EventManager"
import { InteractableManipulation } from "SpectaclesInteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation"
import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty"

@component
export class ConfirmPosition extends BaseScriptComponent {
    private syncEntity: SyncEntity
    private playersReady = StorageProperty.manualInt("playersReady", 0);
    private totalPlayers: number

    @input
    gameManagersToEnable: SceneObject

    @input
    confirmButton: SceneObject

    @input
    chefSelectionButton: SceneObject

    @input
    gameRoot: SceneObject
    private gameRootInteractableManipulation: InteractableManipulation

    onAwake() {
        this.syncEntity = new SyncEntity(this);
        this.syncEntity.notifyOnReady(() => this.onReady())

        this.syncEntity.addStorageProperty(this.playersReady)
    }

    onReady() {
        this.totalPlayers = SessionController.getInstance().getUsers().length
        this.gameRootInteractableManipulation = this.gameRoot.getComponent(InteractableManipulation.getTypeName()) as InteractableManipulation
        
        this.playersReady.onAnyChange.add((newVal: number) => {
            if (newVal === this.totalPlayers) {
                // all players confirmed game positions
                this.chefSelectionButton.enabled = true
                this.gameManagersToEnable.enabled = true
                EventManager.CenterPositionSetLocal.trigger(this.gameRoot.getTransform().getWorldPosition());
            }
        })
    }

    /* Lock position and deactivate button for each individual player */
    public confirmGamePosition() {
        const updatedPlayersReady = this.playersReady.currentOrPendingValue + 1
        this.confirmButton.enabled = false
        this.gameRootInteractableManipulation.enabled = false
        this.playersReady.setPendingValue(updatedPlayersReady)
    }
}
