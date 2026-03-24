import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"

@component
export class MoveObjectToMarker extends BaseScriptComponent {
    @input
    markerTrackingComponent: MarkerTrackingComponent

    @input
    objectUnderMarker: SceneObject
    private objectUnderMarkerTransform: Transform

    private transform: Transform
    private syncEntity: SyncEntity
    private markerFoundFlagStorageProperty = StorageProperty.manualBool("markerFoundFlag", false)

    moveObjectToMarker() {
        // For now, just the first user to see the marker will move the object to the marker
        if (this.markerFoundFlagStorageProperty.currentValue) {
            return 
        }

        // unparent object to get its world transform
        this.objectUnderMarker.removeParent()

        const targetWorldPos = this.objectUnderMarkerTransform.getWorldPosition()
        this.transform.setWorldPosition(targetWorldPos)
        print("object moved to marker position: " + targetWorldPos)

        // reparent the object to the marker
        this.objectUnderMarker.setParentPreserveWorldTransform(this.markerTrackingComponent.getSceneObject())

        this.markerFoundFlagStorageProperty.setPendingValue(true)
    }

    private onReady() {
        this.transform = this.getSceneObject().getTransform()
        this.objectUnderMarkerTransform = this.objectUnderMarker.getTransform()

        // Assign a function to onMarkerFound
        this.markerTrackingComponent.onMarkerFound = () => this.moveObjectToMarker()
    }

    onAwake() {
        this.syncEntity = new SyncEntity(this);
        this.syncEntity.addStorageProperty(this.markerFoundFlagStorageProperty)

        this.syncEntity.notifyOnReady(() => this.onReady())
    }
}
