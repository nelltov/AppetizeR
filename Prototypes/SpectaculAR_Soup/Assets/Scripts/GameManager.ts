import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { InstantiationOptions, Instantiator } from "SpectaclesSyncKit.lspkg/Components/Instantiator";
import { IngredientManager } from "./IngredientManager";
import { EventManager } from "./EventManager";
import { ourRecipes, Recipe0, Recipes } from "./Recipes";

export enum RoundState{
    
    PreRound,
    InRound,
    PostRound
}

@component
export class GameManager extends BaseScriptComponent {

    

    private syncEntity: SyncEntity
    private currentRecipe = StorageProperty.manualInt("currentRecipe", 1)
    private chefSelected = StorageProperty.manualBool("has chef been chose", false);
    private currentChef = StorageProperty.manualString("", "");
    private soupIngredientsCorrect = StorageProperty.manualBool("Soup ing were correct", false);
    private myID : string;

    private player: number | null = null

    @input
    instantiator : Instantiator

    @input
    ingManager: IngredientManager

    @input
    gameStartButton : SceneObject

    @input
    chefPlayerInfo : SceneObject

    @input
    chefRecipeCheckButton : SceneObject

    @input
    victoryObject: SceneObject[]

onReady() 
{
    // Subscribe to synced chef property changes
    this.currentChef.onAnyChange.add(() =>
    {
        print("Chef subscribed");

        this.amITheChef();
    });


}

onAwake() 
{

        //Setting Sync Entity
        this.syncEntity = new SyncEntity(this);

        //Setting up necessary functions and subscriptions once in sessions
        this.syncEntity.notifyOnReady(() => this.onReady())

        //Initializing the Chef Variab;le
        this.syncEntity.addStorageProperty(this.currentChef);
        this.syncEntity.addStorageProperty(this.soupIngredientsCorrect)
        this.syncEntity.addStorageProperty(this.currentRecipe)
        this.syncEntity.addStorageProperty(this.chefSelected)

}
    
public RandomizePlayerRoles()
    {
        if (this.chefSelected.currentOrPendingValue == true) return;  
        //Get the Users in the session
        const users = SessionController.getInstance().getUsers();
        //remap them with connectionID (use this to assign authority later on)
        const ids = users.map(u => (u as any).connectionId as string);

        //Choose a chef

        const chosenChef = this.getRandomElement(users);
        const chosenChefConnectionId = (chosenChef as any).connectionId as string;

        //Set Chef Chosen
        this.chefSelected.setPendingValue(true);
        
        //Set the current Chef Connection ID as a string
        this.currentChef.setPendingValue(chosenChefConnectionId);

        //Make an array of the nonChef players
        const nonChefIds: string[] = ids.filter(id => id !== chosenChefConnectionId);

        //Prefab[] from Instantiator and Manager
        const prefabs = this.ingManager.ingredientPrefabList;
        const total = prefabs.length;
        const nonChefCount = nonChefIds.length;

        
        //assigning a value to each player
        if (nonChefCount <= 0)
            {
                print("No non-chef players to receive ingredients.");
                return;
            }
        else 
            {
            this.player = nonChefCount;
            }

        //making sure to return an Int so the prefab list is devided somewhat fairly between players (**9 objects 4 players means 3 get 2 objects and one will get 3**)
        const baseEach = Math.floor(total / nonChefCount);
        const remainder = total % nonChefCount;

        let prefabIndex = 0;

        //For loop to spawn all the objects correctly Though I don't know how to assign them yet.
        for (let p = 0; p < nonChefCount; p++)
            {
                const receiverId = nonChefIds[p];
                const countForThisPlayer = baseEach + (p < remainder ? 1 : 0);

                for (let k = 0; k < countForThisPlayer; k++)
                {
                    const prefab = prefabs[prefabIndex];
                    prefabIndex++;
                    //Remove the spawn?
                    //maybe spawn oin each player
                    this.spawn(prefab);
        
                }
            }
        
        
        print("Picked chef connectionId = " + chosenChefConnectionId);
    }

private amITheChef()
{   
    print("Am I Chef Event Triggered");
    //Get my own ID
    this.myID = SessionController.getInstance().getLocalUserInfo().connectionId
    //Turn off game Start Locally
    if (this.chefSelected.currentOrPendingValue !== true) return;
    this.gameStartButton.enabled = false;
    //If myid is same as chef I am the chef so I should turn on this local object
    if (this.myID == this.currentChef.currentOrPendingValue){
        this.chefPlayerInfo.enabled = true;
        this.chefRecipeCheckButton.enabled = true;
        print(this.myID + " Should turn on the Chef Info")
    }
}

private playerVictoryActivated(value)
{
    for (let i = 0; i <this.victoryObject.length; i++)
    {
      this.victoryObject[i].enabled = value;  
    }
    
}

private addIngredientDemo()
{
    for(let i=0; i < Recipe0.length; i++)
    this.ingManager.updateStorageProperties(Recipe0[i])
}
private isTheSoupRight(currentRecipeChosen: number): boolean
{
    // Store selected recipe id (synced)
    this.currentRecipe.setPendingValue(currentRecipeChosen);

    // Get pot contents (vec2[] where x=category, y=variantId)
    const pot = this.ingManager.getCurrentIngredientsInPot().currentOrPendingValue;

    // Validate recipe index
    if (currentRecipeChosen < 0 || currentRecipeChosen >= ourRecipes.length)
    {
        print("Soup check failed: invalid recipe index " + currentRecipeChosen);
        return false;
    }

    // Pull the chosen recipe from recipe table
    const chosenRecipeTuple = ourRecipes[currentRecipeChosen]; // [string, IngredientInfo[]]
    const recipeName = chosenRecipeTuple[0];
    const recipe = chosenRecipeTuple[1];

    // Quick fail: different lengths cannot match exactly
    if (pot.length !== recipe.length)
    {
        print("Soup check failed for " + recipeName + ": pot length " + pot.length + " != recipe length " + recipe.length);
        return false;
    }

    // Compare each ingredient slot
    for (let i = 0; i < pot.length; i++)
    {
        const potVec = pot[i];
        const expected = recipe[i];

        // Compare values
        const matches =
            potVec.x === expected.category &&
            potVec.y === expected.variantId;

        if (!matches)
        {
            print(
                "Soup check failed for " + recipeName +
                " at index " + i +
                " pot=(" + potVec.x + "," + potVec.y + ")" +
                " expected=(" + expected.category + "," + expected.variantId + ")"
            );
            return false;
        }
    }

    // If we never failed, it matches
    print("Soup check passed for " + recipeName);
    return true;
}

private isTheSoupRightDemo()
{

    // Get pot contents (vec2[] where x=category, y=variantId)
    const pot = this.ingManager.getCurrentIngredientsInPot().currentOrPendingValue;


    // Quick fail: different lengths cannot match exactly
    if (pot.length !== Recipe0.length)
    {
        print(pot.length + ": pot length and Recipe length is: " + Recipe0)
        this.playerVictoryActivated(false);
        return false;
    }

    // Compare each ingredient slot
    for (let i = 0; i < pot.length; i++)
    {
        const potVec = pot[i];
        const expected = Recipe0[i];

        // Compare values
        const matches =
            potVec.x === expected.category &&
            potVec.y === expected.variantId;

        if (!matches)
        {
            print(
                "Soup check failed for " + Recipe0 +
                " at index " + i +
                " pot=(" + potVec.x + "," + potVec.y + ")" +
                " expected=(" + expected.category + "," + expected.variantId + ")"
            );
            this.playerVictoryActivated(false);
            return false;
        }
    }

    // If we never failed, it matches
    print("Soup check passed for " + Recipe0);
    this.playerVictoryActivated(true);
    return true;
}
    //spawn function from Tic Tac Toe should work well here the only issue I think we still need is to assign players and I think I might follow what tic tac toe did and just give them a value?
private spawn(prefab: ObjectPrefab) 
    {
        if (this.instantiator.isReady()) {
            // Spawn piece using the SpectaclesSyncKit instantiator, set local start position
            const options = new InstantiationOptions()
            //Change to be spawned for a players position
            options.localPosition = new vec3(0,-25,0)

            this.instantiator.instantiate(prefab, options)
        }
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
