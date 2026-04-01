import { IngredientInfo } from "./Ingredients/Ingredient";
import { EventManager } from "Scripts/EventManager";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
import { StorageTypes } from "SpectaclesSyncKit.lspkg/Core/StorageTypes";
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";


@component
export class IngredientManager extends BaseScriptComponent
{
    @input
    debugText: Text;

    @input
    ingredientPrefabList : ObjectPrefab[];

    private syncEntity: SyncEntity
    public currentIngredients: StorageProperty<StorageTypes.vec2Array>

    onAwake()
    {
        // Create SyncEntity and register currentIngredients so the pot list syncs across all players
        this.syncEntity = new SyncEntity(this);
        this.currentIngredients = StorageProperty.manualVec2Array("currentIngredients", []);
        this.syncEntity.addStorageProperty(this.currentIngredients);

        this.syncEntity.notifyOnReady(() => this.onReady())
    }

    onReady()
    {
        // Create a network event to replicate ingredient collisions across all devices
        this.syncEntity.onEventReceived.add('ingredientCollision', (messageInfo) => {
            EventManager.SoupPotIngredientCollisionNetworkEvent.trigger(messageInfo.data as IngredientInfo)
        })

        // Handle the one-time local event, manage synced information, send out network event to all devices
        EventManager.SoupPotIngredientCollisionLocalEvent.add((ingredientInfo: IngredientInfo) =>
        {
            this.debugText.text = this.debugText.text + `\nIngredientManager: ${ingredientInfo.variantName} collided with the pot!`

            this.updateStorageProperties(ingredientInfo);
            this.syncEntity.sendEvent('ingredientCollision', ingredientInfo)
        }); 
    }

    public getCurrentIngredientsInPot()
    {
        return this.currentIngredients;
    }
   
    updateStorageProperties(newIngredient : IngredientInfo)
    {
        const newIngredientToAdd = new vec2(newIngredient.category, newIngredient.variantId)
        const newIngredientList: vec2[] = [...this.currentIngredients.currentOrPendingValue, newIngredientToAdd];
        this.currentIngredients.setPendingValue(newIngredientList)
        print(`Ingredient Manager heard that a ${newIngredient.variantName} collided with the pot and the current length of that list is ${this.currentIngredients.currentOrPendingValue.length}`)
    }
}