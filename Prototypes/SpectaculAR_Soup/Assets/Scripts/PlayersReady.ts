import { ConfirmPosition } from "./ConfirmPosition"
import { EventManager } from "./EventManager"
import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity"

@component
export class PlayersReady extends BaseScriptComponent {
    @input
    public objectsToDisable : SceneObject[]

    @input
    public objectsToEnable : SceneObject[]

    @input
    confirmPositionObject: SceneObject
    private confirmPositionSyncEntity: SyncEntity

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

        EventManager.PlayerReadyEvent.add(() => {
            this.objectsToEnable.forEach((obj) => obj.enabled = true)
            this.objectsToDisable.forEach((obj) => obj.enabled = false)

            this.confirmPositionSyncEntity.sendEvent("playerIsReady", {})
            this.confirmPositionSyncEntity.sendEvent("checkAllPlayersReady", {})
        })
    }
}
