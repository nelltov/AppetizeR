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
    private distanceFromCenter: number = 55  // Distance between plate parent transform and center of table, adjust as needed
    private verticalOffset: number = -12     // Account for pivot point being higher up than the table

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
            for (let i = 0; i < this.ingredientPositions.length; i++) {
                if (i >= ingredientIndices.length) {
                    break // No more ingredients provided
                }

                let ingredientIdx = ingredientIndices[i]
                if (ingredientIdx < this.ingredientPrefabList.length) {
                    let ingredientPrefab = this.ingredientPrefabList[ingredientIdx]
                    let parentToSpawnUnder = this.ingredientPositions[i]
                    if (ingredientPrefab && parentToSpawnUnder) {
                        ingredientPrefab.instantiate(parentToSpawnUnder)
                    }
                }
            }
        })

        EventManager.DisableChefPlate.add(() => {
            if (this.platesObject) {
                this.platesObject.enabled = false
            }
        })

        EventManager.ResetGameNetworkEvent.add(() => {
            this.resetPlayerIngredientObjects()
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

    private resetPlayerIngredientObjects() {
        if (this.platesObject) {
            this.platesObject.enabled = false
        }

        // Deactivate any existing ingredient objects under the ingredient positions
        for (let ingredientPosition of this.ingredientPositions) {
            for (let i = 0; i < ingredientPosition.getChildrenCount(); i++) {
                let child = ingredientPosition.getChild(i)
                child.enabled = false
            }
        }
    }
}
