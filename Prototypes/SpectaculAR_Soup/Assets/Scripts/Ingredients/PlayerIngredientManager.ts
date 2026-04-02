import { EventManager } from "../EventManager";

@component
export class PlayerIngredientManager extends BaseScriptComponent {
    @input
    cameraObject: SceneObject

    @input
    platesObject: SceneObject

    @input
    ingredientPositionsObject: SceneObject
    private ingredientPositions: SceneObject[]

    @input
    ingredientPrefabList : ObjectPrefab[]

    private offset: vec3 = new vec3(0, 0, 0)
    private sceneObj: SceneObject
    private distanceFromCenter: number = 60    // distance between plate parent transform and center of table, adjust as needed
    private verticalOffset: number = -5    // Account for pivot point being higher up than the table

    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        this.sceneObj = this.getSceneObject()
        this.ingredientPositions = this.ingredientPositionsObject.children

        EventManager.CenterPositionSetLocal.add((centerPosition: vec3) => {
            print(`Received center position: ${centerPosition.toString()}`)
            this.movePlatesToTable(centerPosition)

            if (this.platesObject) {
                this.platesObject.enabled = true
            }
        })

        EventManager.SpawnPlayerIngredients.add((ingredientIndices: number[]) => {
            let testIdx = ingredientIndices[0] ?? 0
            if (testIdx < this.ingredientPrefabList.length) {
                print(`Spawning ingredient with index ${testIdx}`)
                let ingredientPrefab = this.ingredientPrefabList[testIdx]
                let parentToSpawnUnder = this.ingredientPositions[0] // hard coded for now
                ingredientPrefab.instantiate(parentToSpawnUnder)
            }
        })
    }

    private movePlatesToTable(centerPosition: vec3) {
        // Calculate offset to be a 20 units away from the center position towards the camera (ignoring y axis)
        let cameraPos = this.cameraObject.getTransform().getWorldPosition()
        let directionToCamera = new vec3(cameraPos.x - centerPosition.x, 0, cameraPos.z - centerPosition.z).normalize()
        this.offset = directionToCamera.uniformScale(this.distanceFromCenter) 
        this.offset = this.offset.add(new vec3(0, this.verticalOffset, 0)) // add vertical offset
        
        this.sceneObj.getTransform().setWorldPosition(centerPosition.add(this.offset))

        let rotation = quat.lookAt(directionToCamera, new vec3(0, 1, 0))
        this.sceneObj.getTransform().setWorldRotation(rotation)
    }
}
