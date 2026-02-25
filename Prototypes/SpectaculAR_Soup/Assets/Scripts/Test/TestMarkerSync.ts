import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"


@component
export class TestMarkerSync extends BaseScriptComponent {
    @input
    markerTrackingComponent: MarkerTrackingComponent

    @input
    objectUnderMarker: SceneObject
    private markerObjectMesh: RenderMeshVisual

    private syncEntity: SyncEntity
    private playerId: number
    private markerFoundFlagStorageProperty = StorageProperty.manualBool("markerFoundFlag", false)

    // Player 1 sets a flag telling all players to change the image markers
    testFunction() {
        if (this.playerId === 1) {
            this.markerFoundFlagStorageProperty.setPendingValue(true)
        }
    }

    flagFoundFunction(newVal: boolean) {
        if (this.markerObjectMesh) {
            this.markerObjectMesh.enabled = !newVal
        }
    }

    onReady() {
        this.playerId = SessionController.getInstance().getUsers().length

        // Assign a function to onMarkerFound
        this.markerTrackingComponent.onMarkerFound = () => this.testFunction()

        this.markerObjectMesh = this.objectUnderMarker.getComponent("Component.RenderMeshVisual")

        // Attach listener in onReady so that the function is not called when storage property is being initialized
        this.markerFoundFlagStorageProperty.onAnyChange.add((newVal: boolean) => this.flagFoundFunction(newVal))
    }

    onAwake() {
        this.syncEntity = new SyncEntity(this);
        this.syncEntity.addStorageProperty(this.markerFoundFlagStorageProperty)

        this.syncEntity.notifyOnReady(() => this.onReady())
    }
}
