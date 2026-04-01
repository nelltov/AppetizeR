import { EventManager } from "../EventManager";

@component
export class PlayerIngredientManager extends BaseScriptComponent {
    @input
    cameraObject: SceneObject

    @input
    platesObject: SceneObject

    private offset: vec3 = new vec3(0, 0, 0)
    private sceneObj: SceneObject
    private distanceFromCenter: number = 100    // distance between plate parent transform and center of table, adjust as needed

    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        this.sceneObj = this.getSceneObject()

        EventManager.CenterPositionSetLocal.add((centerPosition: vec3) => {
            print(`Received center position: ${centerPosition.toString()}`)

            // Calculate offset to be a 20 units away from the center position towards the camera (ignoring y axis)
            let cameraPos = this.cameraObject.getTransform().getWorldPosition()
            let directionToCamera = new vec3(cameraPos.x - centerPosition.x, 0, cameraPos.z - centerPosition.z).normalize()
            this.offset = directionToCamera.uniformScale(this.distanceFromCenter) 
            
            this.sceneObj.getTransform().setWorldPosition(centerPosition.add(this.offset))

            let rotation = quat.lookAt(directionToCamera, new vec3(0, 1, 0))
            this.sceneObj.getTransform().setWorldRotation(rotation)

            if (this.platesObject) {
                this.platesObject.enabled = true
            }
        })
    }
}
