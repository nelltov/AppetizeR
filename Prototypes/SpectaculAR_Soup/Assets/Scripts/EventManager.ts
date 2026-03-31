import { EventWrapper } from "SpectaclesSyncKit.lspkg/Core/EventWrapper";
import { IngredientInfo } from "./Ingredients/Ingredient";

/**
 * Defines the events that scripts can subscribe to and trigger in the project.
 */
@component
export class EventManager extends BaseScriptComponent {
    static SoupPotIngredientCollisionNetworkEvent = new EventWrapper<[IngredientInfo]>() 
    static SoupPotIngredientCollisionLocalEvent = new EventWrapper<[IngredientInfo, string]>() 
    static PlayerVictoryNetworkEvent = new EventWrapper()
    static PlayerVictoryLocalEvent = new EventWrapper()
    static ChefSelectedEvent = new EventWrapper<boolean[]>() 
    static UpdateSoupSwirlAmount = new EventWrapper<[number]>()

    // Add more events as needed, following the pattern above.
    // Specify the event name and the types of parameters it should accept.
}
