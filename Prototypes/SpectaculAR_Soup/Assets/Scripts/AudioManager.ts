import { IngredientInfo } from "./Ingredients/Ingredient";
import { EventManager } from "Scripts/EventManager";
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity";

@component
export class AudioManager extends BaseScriptComponent {
    @input
    isPizza: boolean = false

    private syncEntity: SyncEntity;
    private audio: AudioComponent;

    @input
    public audioVictoryTrack: AudioTrackAsset;

    @input
    public audioLoserTrack: AudioTrackAsset;

    @input
    public audioCollisionTrack: AudioTrackAsset;
    
    onAwake() {
        // Create SyncEntity and register currentIngredients so the pot list syncs across all players
        this.syncEntity = new SyncEntity(this);
        this.audio = this.sceneObject.getComponent("Component.AudioComponent");
        this.syncEntity.notifyOnReady(() => this.onReady())
    }

    onReady() {
        EventManager.PlayerVictoryNetworkEvent.add((isVictory: boolean) => {
            this.audio.audioTrack = isVictory ? this.audioVictoryTrack : this.audioLoserTrack;
            this.audio.play(1);
        })

        EventManager.SoupPotIngredientCollisionNetworkEvent.add((_: IngredientInfo) => {
            if (this.isPizza) {
                return  // Don't play splash sound if this is the pizza prototype
            }
            this.audio.audioTrack = this.audioCollisionTrack; 
            this.audio.play(1);
        })
    }
}
