import { IngredientInfo } from "./Ingredients/Ingredient";
import { EventManager } from "./EventManager";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
import { StorageTypes } from "SpectaclesSyncKit.lspkg/Core/StorageTypes";
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";


@component
export class IngredientManager extends BaseScriptComponent
{
    private syncEntity: SyncEntity
    public currentIngredients: StorageProperty<StorageTypes.intArray>

    onAwake() {
        // Create SyncEntity and register currentIngredients so the pot list syncs across all players
        this.syncEntity = new SyncEntity(this)
        this.currentIngredients = StorageProperty.manualIntArray("currentIngredients", [])
        this.syncEntity.addStorageProperty(this.currentIngredients)

        this.syncEntity.notifyOnReady(() => this.onReady())
    }

    onReady() {
        // Create a network event to replicate ingredient collisions across all devices
        this.syncEntity.onEventReceived.add('ingredientCollision', (messageInfo) => {
            EventManager.SoupPotIngredientCollisionNetworkEvent.trigger(messageInfo.data as IngredientInfo)
        })

        // Handle the one-time local event, manage synced information, send out network event to all devices
        EventManager.SoupPotIngredientCollisionLocalEvent.add((ingredientInfo: IngredientInfo) => {
            this.updateStorageProperties(ingredientInfo);
            this.syncEntity.sendEvent('ingredientCollision', ingredientInfo)
        })
    }

    public getCurrentIngredientsInPot() {
        return this.currentIngredients
    }
   
    updateStorageProperties(newIngredient: IngredientInfo) {
        const newIngredientToAdd = newIngredient.ingredient as number
        const newIngredientList: number[] = [...this.currentIngredients.currentOrPendingValue, newIngredientToAdd]
        this.currentIngredients.setPendingValue(newIngredientList)
    }

    public resetCurrentIngredients() {
        this.currentIngredients.setPendingValue([])
    }
}