import { EventManager } from "./EventManager";

@component
export class PlayerPersonalObjectsManager extends BaseScriptComponent {
    @input
    saltShaker: SceneObject

    @input
    cameraObject: SceneObject

    @input
    nonChefObjects: SceneObject

    @input
    chefObjects: SceneObject

    @input
    instructionObject: SceneObject

    @input
    ingredientPositionsObject: SceneObject
    private ingredientPositions: SceneObject[]

    @input
    ingredientPrefabList: ObjectPrefab[]

    /* Positioning the entire interface relative to the center of the table */ 
    private offset: vec3 = new vec3(0, 0, 0)
    private sceneObj: SceneObject
    private distanceFromCenter: number = 50  // Distance between plate parent transform and center of table, adjust as needed
    private verticalOffset: number = -12     // Account for pivot point being higher up than the table

    private saltieOriginalPosition: vec3
    private saltieOriginalRotation: quat

    onAwake() {
        // Set up during Start event after all components are awake
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        // Initialize object
        this.sceneObj = this.getSceneObject()
        this.ingredientPositions = this.ingredientPositionsObject.children
        this.resetPlayerIngredientObjects()

        // specifically hide on start, otherwise resetting should make them visible
        this.setObjectVisibility(this.nonChefObjects, false)  
        this.setObjectVisibility(this.saltShaker, false)  

        // Bind events
        EventManager.CenterPositionSetLocal.add((centerPosition: vec3) => {
            this.movePlatesToTable(centerPosition)
            this.setObjectVisibility(this.nonChefObjects, true)
            this.setObjectVisibility(this.saltShaker, true)
            
            // Get original position and rotation of Saltie relative to where the objects spawn
            if (this.saltShaker) {
                const saltTransform = this.saltShaker.getTransform()
                this.saltieOriginalPosition = saltTransform?.getLocalPosition()
                this.saltieOriginalRotation = saltTransform?.getLocalRotation()
            }
        })

        EventManager.SpawnPlayerIngredients.add((ingredientIndices: number[]) => {
            // Spawn ingredients
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

            // Show instructions
            this.setObjectVisibility(this.instructionObject, true)
        })

        EventManager.SpawnChefInstructions.add((_) => {
            this.setObjectVisibility(this.instructionObject, true)
            this.setObjectVisibility(this.nonChefObjects, false) 
            this.setObjectVisibility(this.chefObjects, true)
        })

        EventManager.PlayerVictoryNetworkEvent.add((_) => {
            this.resetSaltiePosition()
        })

        EventManager.ResetGameNetworkEvent.add(() => {
            this.resetPlayerIngredientObjects()
        })
    }

    private movePlatesToTable(centerPosition: vec3) {
        // Calculate offset to be {distanceFromCenter} units away from the center position towards the camera (ignoring y axis)
        let cameraPos = this.cameraObject.getTransform().getWorldPosition()
        let directionToCamera = new vec3(cameraPos.x - centerPosition.x, 0, cameraPos.z - centerPosition.z).normalize()
        this.offset = directionToCamera.uniformScale(this.distanceFromCenter) 
        this.offset = this.offset.add(new vec3(0, this.verticalOffset, 0)) // add vertical offset
        
        this.sceneObj.getTransform().setWorldPosition(centerPosition.add(this.offset))

        let rotation = quat.lookAt(directionToCamera, new vec3(0, 1, 0))
        this.sceneObj.getTransform().setWorldRotation(rotation)
    }

    private resetPlayerIngredientObjects() {
        this.setObjectVisibility(this.nonChefObjects, true)    // empty plates
        this.setObjectVisibility(this.saltShaker, true)        // saltie model
        this.setObjectVisibility(this.chefObjects, false) 
        this.setObjectVisibility(this.instructionObject, false)

        // Deactivate any existing ingredient objects under the ingredient positions
        for (let ingredientPosition of this.ingredientPositions) {
            for (let child of ingredientPosition.children) {
                this.setObjectVisibility(child, false)
            }
        }
    }

    private resetSaltiePosition() {
        if (this.saltShaker) {
            const saltTransform = this.saltShaker.getTransform()
            saltTransform.setLocalPosition(this.saltieOriginalPosition)
            saltTransform.setLocalRotation(this.saltieOriginalRotation)
        }
    }

    private setObjectVisibility(object: SceneObject, isVisible: boolean) {
        if (object) {
            object.enabled = isVisible
        }
    }
}
