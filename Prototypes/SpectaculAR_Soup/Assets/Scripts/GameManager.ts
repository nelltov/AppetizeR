import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { InstantiationOptions, Instantiator } from "SpectaclesSyncKit.lspkg/Components/Instantiator";
import { IngredientManager } from "./IngredientManager";
import { EventManager } from "./EventManager";
import { ourRecipes, Recipe0, Recipes } from "./Recipes";

export enum RoundState{
    
    PreRound, //0
    InRound, //1
    PostRound //2
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

    this.chefSelected.onAnyChange.add(() =>
    {
        this.amITheChef();
    });

    // Handle late-joiners: if chef was already selected before this player joined,
    // onAnyChange will never fire, so check the current value immediately
    this.amITheChef();
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

        // Pick a random chef and collect all non-chef players
        const users = SessionController.getInstance().getUsers();
        const chefId = (this.getRandomElement(users) as any).connectionId as string;
        const nonChefIds = users
            .map(u => (u as any).connectionId as string)
            .filter(id => id !== chefId);


        if (nonChefIds.length === 0)
        {
            print("No non-chef players to receive ingredients.");
            return;
        }

        this.assignChef(chefId, nonChefIds.length);

        // Distribute ingredient prefabs as evenly as possible across non-chef players
        // e.g. 9 prefabs / 4 players → 3 players get 2, 1 player gets 3
        const prefabs = this.ingManager.ingredientPrefabList;
        const baseEach = Math.floor(prefabs.length / nonChefIds.length);
        const remainder = prefabs.length % nonChefIds.length;

        let prefabIndex = 0;
        for (let p = 0; p < nonChefIds.length; p++)
        {
            const countForThisPlayer = baseEach + (p < remainder ? 1 : 0);
            for (let k = 0; k < countForThisPlayer; k++)
            {
                this.spawn(prefabs[prefabIndex++]);
            }
        }
    }

private assignChef(chefId: string, nonChefCount: number)
{
    this.chefSelected.setPendingValue(true);
    this.currentChef.setPendingValue(chefId);
    this.player = nonChefCount;
    print("Picked chef connectionId = " + chefId);
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
