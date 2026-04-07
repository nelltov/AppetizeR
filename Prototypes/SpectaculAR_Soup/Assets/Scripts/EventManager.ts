import { EventWrapper } from "SpectaclesSyncKit.lspkg/Core/EventWrapper";
import { IngredientInfo } from "./Ingredients/Ingredient";

/**
 * Defines the events that scripts can subscribe to and trigger in the project.
 */
@component
export class EventManager extends BaseScriptComponent {
    // Game Events
    static CenterPositionSetLocal = new EventWrapper<[vec3]>()
    static SpawnPlayerIngredients = new EventWrapper<[number[]]>()
    static SpawnChefInstructions = new EventWrapper<[IngredientInfo[]]>()
    static NextInstructionNetworkEvent = new EventWrapper()
    static NextInstructionLocalEvent = new EventWrapper()
    static SoupPotIngredientCollisionNetworkEvent = new EventWrapper<[IngredientInfo]>() 
    static SoupPotIngredientCollisionLocalEvent = new EventWrapper<[IngredientInfo]>() 
    static CheckSoupLocalEvent = new EventWrapper()
    static CheckSoupNetworkEvent = new EventWrapper()

    // Game States
    static PlayerVictoryNetworkEvent = new EventWrapper<[boolean]>()
    static PlayerVictoryLocalEvent = new EventWrapper<[boolean]>()
    static ResetGameNetworkEvent = new EventWrapper()

    // Shader
    static UpdateSoupSwirlAmount = new EventWrapper<[number]>()

    // Add more events as needed, following the pattern above.
    // Specify the event name and the types of parameters it should accept.
}
