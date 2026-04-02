import { IngredientInfo } from "./Ingredients/Ingredient";
import { EventManager } from "Scripts/EventManager";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
import { StorageTypes } from "SpectaclesSyncKit.lspkg/Core/StorageTypes";
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";

@component
export class AudioManager extends BaseScriptComponent {

    private syncEntity: SyncEntity;
    private audio: AudioComponent;
    
    onAwake()
    {
        // Create SyncEntity and register currentIngredients so the pot list syncs across all players
        this.syncEntity = new SyncEntity(this);
        this.audio = this.sceneObject.getComponent("Component.AudioComponent");
        this.syncEntity.notifyOnReady(() => this.onReady())
    }

    onReady()
    {
        /* Create a network event to replicate ingredient collisions across all devices
        this.syncEntity.onEventReceived.add('ingredientCollision', (messageInfo) => {
            EventManager.SoupPotIngredientCollisionNetworkEvent.trigger(messageInfo.data as IngredientInfo)
        })*/

        // Handle the one-time local event, manage synced information, send out network event to all devices
        EventManager.SoupPotIngredientCollisionLocalEvent.add((ingredientInfo: IngredientInfo) =>
        {
            
            //this.syncEntity.sendEvent('ingredientCollision', ingredientInfo)
        }); 
    }
}
