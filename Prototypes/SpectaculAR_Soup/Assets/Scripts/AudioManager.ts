import { setTimeout } from "SpectaclesInteractionKit.lspkg/Utils/FunctionTimingUtils";
import { IngredientInfo } from "./Ingredients/Ingredient";
import { EventManager } from "Scripts/EventManager";
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty";
import { StorageTypes } from "SpectaclesSyncKit.lspkg/Core/StorageTypes";
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";

@component
export class AudioManager extends BaseScriptComponent {

    private syncEntity: SyncEntity;
    private audio: AudioComponent;

    @input
    public audioVictoryTrack: AudioTrackAsset;

    @input
    public audioLoserTrack: AudioTrackAsset;

    @input
    public audioCollisionTrack: AudioTrackAsset;
    
    onAwake()
    {
        // Create SyncEntity and register currentIngredients so the pot list syncs across all players
        this.syncEntity = new SyncEntity(this);
        this.audio = this.sceneObject.getComponent("Component.AudioComponent");
        this.syncEntity.notifyOnReady(() => this.onReady())
    }

    onReady()
    {



        EventManager.PlayerVictoryNetworkEvent.add(() =>
        {

            this.audio.audioTrack = this.audioVictoryTrack; 
            this.audio.play(1);
        }); 

        EventManager.SoupPotIngredientCollisionLocalEvent.add((ingredientInfo: IngredientInfo) =>
        {
            this.audio.audioTrack = this.audioCollisionTrack; 
            delay(0.5, () => 
            {
                print("ran after 0.5s");
                
                this.audio.play(1);
            });

        }); 

        function delay(seconds: number, callback: () => void): void 
            {
                const delayEvent = this.createEvent("DelayedCallbackEvent");
                    delayEvent.bind(callback);
                    delayEvent.reset(seconds);
            }
    }

    
}
