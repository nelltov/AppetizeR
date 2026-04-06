import { Instantiator, InstantiationOptions } from "SpectaclesSyncKit.lspkg/Components/Instantiator"
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import { EventManager } from "Scripts/EventManager";
import { IngredientInfo } from "Scripts/Ingredients/Ingredient";
import { transformPoint } from "SpectaclesInteractionKit.lspkg/Utils/mathUtils"

@component
export class HalvesGameManager extends BaseScriptComponent {
    @input
    instantiator: Instantiator
    @input
    ingredientsPrefab: ObjectPrefab[]
    // @input
    // ingManager: IngredientManager 

    private syncEntity: SyncEntity

    onAwake() {
        this.syncEntity = new SyncEntity(this)
        this.syncEntity.notifyOnReady(() => this.onReady())
        print("on awake lol")
    }

    // Spawn plate objects for each player
    onReady() {
        if (this.instantiator.isReady()) {
            const options = new InstantiationOptions()
            // options.localPosition = new vec3(0, -20, -15)

            let localPos = this.sceneObject.getTransform().getLocalPosition()
            print(`player is starting at at ${transformPoint(this.sceneObject.getTransform(), localPos)}`)
            let offset = new vec3(0, 0, -100)
            let worldPos = transformPoint(this.sceneObject.getTransform(), localPos.add(offset))

            options.worldPosition = worldPos
            print(`spawning ingredients at ${worldPos}`)
            this.instantiator.instantiate(this.ingredientsPrefab[0], options)
        }

        // Create a network event to replicate ingredient collisions across all devices
        this.syncEntity.onEventReceived.add('ingredientCollision', (messageInfo) => {
            EventManager.SoupPotIngredientCollisionNetworkEvent.trigger(messageInfo.data as IngredientInfo)
        })

        // bind game manager event
        EventManager.SoupPotIngredientCollisionLocalEvent.add((ingredientInfo: IngredientInfo) => {
            print(`from Game Manager - Ingredient collided with pot: ${ingredientInfo.variantName}`)
            // this.ingManager.updateStorageProperties(ingredientInfo);
            this.syncEntity.sendEvent('ingredientCollision', ingredientInfo)
        })
    }
}
