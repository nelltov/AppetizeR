import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";
import { findSceneObjectByName } from "SpectaclesInteractionKit.lspkg/Utils/SceneObjectUtils";

@component
export class BillboardHelper extends BaseScriptComponent {

    private camera!: SceneObject;
    onAwake() {

        this.camera = global.scene.getRootObject(0).getChild(0);
        print(this.camera);
        const update = this.createEvent("UpdateEvent")

        update.bind(() =>
        {
            
            const t = this.camera.getTransform();
            this.sceneObject.getTransform().setWorldRotation(t.getWorldRotation());
        })
    }

}
