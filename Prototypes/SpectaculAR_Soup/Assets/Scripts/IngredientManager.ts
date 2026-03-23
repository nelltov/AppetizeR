import { getEnumMember, getEnumMemberName, IngredientCategory } from "./Ingredients/IngredientTypes";
import { IngredientInfo } from "./Ingredients/Ingredient";
import { EventManager } from "Scripts/EventManager";
import { StoragePropertySet } from "SpectaclesSyncKit.lspkg/Core/StoragePropertySet";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
import { StorageTypes } from "SpectaclesSyncKit.lspkg/Core/StorageTypes";
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";


@component
export class IngredientManager extends BaseScriptComponent
{
    @input
    ingredientPrefabList : ObjectPrefab[];

    public currentIngredients: StorageProperty<StorageTypes.vec2Array>
    private syncEntity: SyncEntity

    onAwake()
    {
        // Create SyncEntity and register currentIngredients so the pot list syncs across all players
        this.syncEntity = new SyncEntity(this);
        this.currentIngredients = StorageProperty.manualVec2Array("currentIngredients", []);
        this.syncEntity.addStorageProperty(this.currentIngredients);

        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart()
    {
        this.syncEntity.notifyOnReady(() =>
        {
            EventManager.SoupPotIngredientCollisionLocalEvent.add((ingredientInfo: IngredientInfo) =>
            {
                print(`Ingredient Manager heard the collision`);
                this.updateStorageProperties(ingredientInfo);
                EventManager.SoupPotIngredientCollisionNetworkEvent.trigger(ingredientInfo)
            });
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
        print(`Ingredient Manager heard that a ${newIngredient.variantName} collided with the pot`)
    }
}