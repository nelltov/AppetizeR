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
    startButton: SceneObject
    @input
    nextIngredientButton: SceneObject
    @input
    endGameButtons: SceneObject

    @input
    instructionObject: SceneObject

    @input
    ingredientPositionsObject: SceneObject
    private ingredientPositions: SceneObject[]
    private apprenticeIngredients: SceneObject[] = []

    @input
    ingredientPrefabList: ObjectPrefab[]

    /* Positioning the entire interface relative to the center of the table */ 
    private offset: vec3 = new vec3(0, 0, 0)
    private sceneObj: SceneObject
    private distanceFromCenter: number = 50  // Distance between plate parent transform and center of table, adjust as needed
    private verticalOffset: number = -12     // Account for pivot point being higher up than the table

    private saltieOriginalPosition: vec3
    private saltieOriginalRotation: quat
    private saltieOriginalPositionSet: boolean

    @input
    saltieAboveSoupObject: SceneObject
    private saltieAboveSoupPosition: vec3
    private saltieAboveSoupRotation: quat
    private saltieAboveSoupPositionSet: boolean

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
        this.saltieOriginalPositionSet = false
        this.saltieAboveSoupPositionSet = false
        this.apprenticeIngredients = []

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
                this.saltieOriginalPositionSet = true
            }

            // Position of Saltie above soup for displaying results
            if (this.saltieAboveSoupObject) {
                const saltAboveSoupTransform = this.saltieAboveSoupObject.getTransform()
                this.saltieAboveSoupPosition = saltAboveSoupTransform?.getWorldPosition()
                this.saltieAboveSoupRotation = saltAboveSoupTransform?.getWorldRotation()
                this.saltieAboveSoupPositionSet = true
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
                        let spawnedIngredient = ingredientPrefab.instantiate(parentToSpawnUnder)
                        this.apprenticeIngredients.push(spawnedIngredient)
                        spawnedIngredient.enabled = false   // don't enable them until game has started
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
            this.setObjectVisibility(this.startButton, true)
        })

        EventManager.ChefStartedGameNetwork.add(() => {
            // Chef buttons
            this.setObjectVisibility(this.startButton, false)
            this.setObjectVisibility(this.nextIngredientButton, true)

            // Make apprentice ingredients visible
            if (this.apprenticeIngredients.length > 0) {
                this.apprenticeIngredients.forEach((ingredient) => {
                    ingredient.enabled = true
                })
            }
        })

        EventManager.CheckSoupNetworkEvent.add(() => {
            this.setObjectVisibility(this.nextIngredientButton, false)
        })

        EventManager.PlayerVictoryNetworkEvent.add((_) => {
            this.moveSaltieAboveSoup()
            this.setObjectVisibility(this.nextIngredientButton, false)
            this.setObjectVisibility(this.endGameButtons, true)

            // Deactivate apprentice ingredients visible
            if (this.apprenticeIngredients.length > 0) {
                this.apprenticeIngredients.forEach((ingredient) => {
                    ingredient.enabled = false
                })
            }
        })

        EventManager.ResetGameNetworkEvent.add(() => {
            this.resetPlayerIngredientObjects()
        })

        EventManager.EndGameNetworkEvent.add(() => {
            this.setObjectVisibility(this.endGameButtons, false)
        })
    }

    public StartGame() {
        EventManager.ChefStartedGameLocal.trigger()
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
        this.resetSaltiePosition()
        this.setObjectVisibility(this.saltShaker, true)        // saltie model
        this.setObjectVisibility(this.chefObjects, false) 
        this.setObjectVisibility(this.startButton, false) 
        this.setObjectVisibility(this.nextIngredientButton, false) 
        this.setObjectVisibility(this.endGameButtons, false) 
        this.setObjectVisibility(this.instructionObject, false)

        // Deactivate any existing ingredient objects under the ingredient positions
        for (let ingredientPosition of this.ingredientPositions) {
            for (let child of ingredientPosition.children) {
                this.setObjectVisibility(child, false)
            }
        }

        // Clear out apprentice ingredients
        this.apprenticeIngredients.splice(0, this.apprenticeIngredients.length)
    }

    private resetSaltiePosition() {
        if (this.saltieOriginalPositionSet) {
            const saltTransform = this.saltShaker.getTransform()
            saltTransform.setLocalPosition(this.saltieOriginalPosition)
            saltTransform.setLocalRotation(this.saltieOriginalRotation)
        }
    }

    private moveSaltieAboveSoup() {
        if (this.saltieAboveSoupPositionSet) {
            const saltTransform = this.saltShaker.getTransform()
            saltTransform.setWorldPosition(this.saltieAboveSoupPosition)
            saltTransform.setWorldRotation(this.saltieAboveSoupRotation)
        }
    }

    private setObjectVisibility(object: SceneObject, isVisible: boolean) {
        if (object) {
            object.enabled = isVisible
        }
    }
}
