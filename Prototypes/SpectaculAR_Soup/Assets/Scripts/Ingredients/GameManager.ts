import { getEnumMember, getEnumMemberName, IngredientCategory } from "./IngredientTypes";
import {SyncEntity} from "SpectaclesSyncKit.lspkg/Core/SyncEntity";
import {StorageProperty} from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import {SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { IngredientInfo } from "./Ingredient";

type Recipes = [string, IngredientInfo[]] 


export const Recipe0 : IngredientInfo[] = [
    new IngredientInfo(1,1),    //Onion
    new IngredientInfo(1,11),   //Garlic
    new IngredientInfo(0,0),    //Beef
    new IngredientInfo(3,4),    //ChickenBroth
    new IngredientInfo(1,6),    //Tomato
    new IngredientInfo(1,2),    //Carrot
    new IngredientInfo(2,5)     //Rosemary
]

export const Recipe1 : IngredientInfo[] = [
    new IngredientInfo(1,1),    //Onion
    new IngredientInfo(1,7),    //Celery
    new IngredientInfo(0,1),    //Chicken
    new IngredientInfo(1,2),    //Carrot
    new IngredientInfo(1,0),    //Potatoe
    new IngredientInfo(4,6),    //Bay Leaf
    new IngredientInfo(5,0)     //Noodles
]

const ourRecipes : Recipes[] = [
    ["BeefStew", Recipe0],
    ["Chicken Noodle", Recipe1]
    
]

