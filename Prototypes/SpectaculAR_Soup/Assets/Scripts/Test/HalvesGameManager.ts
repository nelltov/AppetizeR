import { Instantiator, InstantiationOptions } from "SpectaclesSyncKit.lspkg/Components/Instantiator"
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import { EventManager } from "Scripts/EventManager";
import { IngredientInfo } from "Scripts/Ingredients/Ingredient";
import { IngredientManager } from "Scripts/IngredientManager";

@component
export class HalvesGameManager extends BaseScriptComponent {
    @input
    instantiator: Instantiator
    @input
    ingredientsPrefab: ObjectPrefab
    @input
    ingManager: IngredientManager 

    private syncEntity: SyncEntity

    

    onAwake() {
        this.syncEntity = new SyncEntity(this)
        this.syncEntity.notifyOnReady(() => this.onReady())
    }

    // Spawn plate objects for each player
    onReady() {
        if (this.instantiator.isReady()) {
            print("spawning ingredients")
            const options = new InstantiationOptions()
            options.localPosition = new vec3(0, -25, 0)
            this.instantiator.instantiate(this.ingredientsPrefab, options)
            
        }

        // Create a network event to replicate ingredient collisions across all devices
        this.syncEntity.onEventReceived.add('ingredientCollision', (messageInfo) => {
            EventManager.SoupPotIngredientCollisionEvent.trigger(messageInfo.data as IngredientInfo)
        })

        // bind game manager event
        EventManager.SoupPotIngredientCollisionEvent.add((ingredientInfo: IngredientInfo) => {
            print(`from Game Manager - Ingredient collided with pot: ${ingredientInfo.variantName}`)
            this.ingManager.updateStorageProperties(ingredientInfo);
            this.syncEntity.sendEvent('ingredientCollision', ingredientInfo)
        })
    }
}
