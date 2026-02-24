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
    private currentChef = StorageProperty.manualString("currentChefConnectionId", "");
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

    onReady() 
    {
    // Subscribe to synced chef property changes
    this.currentChef.onAnyChange.add((newChefId: string) =>
    {
        print("Chef changed to: " + newChefId);

        this.amITheChef();
    });
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
    this.gameStartButton.enabled = false;
    //If myid is same as chef I am the chef so I should turn on this local object
    if (this.myID == this.currentChef.currentOrPendingValue){
        this.chefPlayerInfo.enabled = true;
        print(this.myID + " Should turn on the Chef Info")
    }
}

private isTheSoupRight(currentRecipeChosen: number): boolean
    {
        // Store selected recipe id (synced)
        this.currentRecipe.setPendingValue(currentRecipeChosen);

        // Get the pot ingredients list (vec2 pairs, apparently)
        const pot = this.ingManager.getCurrentIngredientsInPot().currentOrPendingValue;

        // Pick which recipe list to compare against
        // TODO: replace this with your real selection from Recipes/ourRecipes if available.
        const recipe = Recipe0;

        // Quick fail: different lengths means it can't be an exact match
        if (pot.length !== recipe.length)
        {
            print("Soup check failed: pot length " + pot.length + " != recipe length " + recipe.length);
            return false;
        }

        // Compare every entry
        for (let i = 0; i < pot.length; i++)
        {
            const potVec = pot[i];

            // Build the "expected" values for this slot
            const expectedCategory = recipe[i].category;
            const expectedVariantId = recipe[i].variantId;

            // IMPORTANT: don't use `potVec == new vec2(...)`.
            // Compare components (x/y) so it checks VALUES, not object identity.
            const matches =
                potVec.x === expectedCategory &&
                potVec.y === expectedVariantId;

            if (!matches)
            {
                print("Soup check failed at index " + i +
                    " pot=(" + potVec.x + "," + potVec.y + ")" +
                    " expected=(" + expectedCategory + "," + expectedVariantId + ")");
                return false;
            }
        }

        // If we never failed, it's correct
        print("Soup check passed: all ingredients match.");
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
