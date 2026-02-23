import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { Instantiator } from "SpectaclesSyncKit.lspkg/Components/Instantiator";
import { IngredientManager } from "./IngredientManager";

export enum RoundState{
    
    PreRound,
    InRound,
    PostRound
}

@component
export class GameManager extends BaseScriptComponent {

    

    private syncEntity: SyncEntity
    private currentRecipe = StorageProperty.manualInt("currentRecipe", 1)
    private currentChef = StorageProperty.manualString("currentChefConnectionId", "");

    private chosenPlayersId = StorageProperty.manualStringArray("playerIDs")

    @input
    instantiator : Instantiator

    @input
    ingManager: IngredientManager

    @input
    gameStartButton : SceneObject
    


    onReady() 
    {

    }


    onAwake() {

        //Setting Sync Entity
        this.syncEntity = new SyncEntity(this);

        //Setting up necessary functions and subscriptions once in sessions
        this.syncEntity.notifyOnReady(() => this.onReady())

        //Initializing the Chef Variab;le
        this.syncEntity.addStorageProperty(this.currentChef);

    }
    
public RandomizePlayerRoles()
{
    //Get the Users in the session
    const users = SessionController.getInstance().getUsers();
    //remap them with connectionID (use this to assign authority later on)
    const ids = users.map(u => (u as any).connectionId as string);

    //Choose a chef
    const chosenChef = this.getRandomElement(users);
    const chosenChefConnectionId = (chosenChef as any).connectionId as string;

    this.currentChef.setPendingValue(chosenChefConnectionId);

    //Make an array of the nonChef players
    const nonChefIds: string[] = ids.filter(id => id !== chosenChefConnectionId);


    const prefabs = this.ingManager.ingredientPrefabList;
    const total = prefabs.length;
    const nonChefCount = nonChefIds.length;

    if (nonChefCount <= 0)
    {
        print("No non-chef players to receive ingredients.");
        return;
    }

    const baseEach = Math.floor(total / nonChefCount);
    const remainder = total % nonChefCount;

    let prefabIndex = 0;

    for (let p = 0; p < nonChefCount; p++)
    {
        const receiverId = nonChefIds[p];
        const countForThisPlayer = baseEach + (p < remainder ? 1 : 0);

        for (let k = 0; k < countForThisPlayer; k++)
        {
            const prefab = prefabs[prefabIndex];
            prefabIndex++;

            // Spawn once per object
            const spawned = this.instantiator.instantiate(prefab);
            print(spawned);
        
        }
    }

    print("Picked chef connectionId = " + chosenChefConnectionId);
}
    getRandomElement<T>(array: T[]): T | undefined
    {
        if (array.length === 0)
        {
            return undefined;
        }
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }
}
