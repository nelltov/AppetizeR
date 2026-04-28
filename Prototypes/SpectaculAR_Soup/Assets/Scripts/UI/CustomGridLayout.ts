import { GridLayout, LayoutDirection } from "SpectaclesUIKit.lspkg/Scripts/Components/GridLayout/GridLayout";
import { EventManager } from "../EventManager";

@component
export class CustomGridLayout extends BaseScriptComponent {

    @input
    imagePrefab: ObjectPrefab

    @input
    item_dimensions: vec2

    @input
    gridObj: SceneObject
    private gridComp: GridLayout

    @input
    selectedImageMaterial: Material
    private currentIngredientIndex: number

    onAwake() {
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        this.currentIngredientIndex = -1
        this.gridComp = this.gridObj.getComponent(GridLayout.getTypeName()) as GridLayout

        EventManager.SpawnChefInstructions.add((recipeIngredients) => {
            this.buildGridLayout(recipeIngredients.length)
        })

        // Select the next ingredient when the chef advances to the next step
        EventManager.NextInstructionLocalEvent.add(() => {
            this.currentIngredientIndex++
            this.selectGridItem(this.currentIngredientIndex)
        })

        // Clear the grid when the game resets
        EventManager.ResetGameNetworkEvent.add(() => {
            this.clearGridLayout()
            this.currentIngredientIndex = -1
        })
    }

    private buildGridLayout(rows: number): void {
        // Set grid layout properties
        this.gridComp.columns  = 1
        this.gridComp.rows     = rows
        this.gridComp.cellSize = this.item_dimensions
        this.gridComp.layoutBy = LayoutDirection.Row
        this.gridComp.cellPadding = new vec4(0.05, 0.05, 0.05, 0.05)

        // Initialize child objects in the grid
        for (let i = 0; i < rows; i++) {
            this.imagePrefab.instantiate(this.gridObj) 
        }

        // Defer one tick so every child is registered before layout runs
        const ev = this.createEvent("DelayedCallbackEvent")
        ev.bind(() => {
            this.gridComp.layout()
        })
        ev.reset(0)
    }

    private selectGridItem(index: number): void {
        if (index < 0 || index >= this.gridObj.getChildrenCount()) {
            return
        }

        const child = this.gridObj.getChild(index)
        let imageComp = child.getComponent("Component.Image") as Image
        if (imageComp) {
            imageComp.materials = [this.selectedImageMaterial]
        } else {
            print("image component not found on grid item at index " + index)
        }
    }

    private clearGridLayout(): void {
        if (this.gridObj.getChildrenCount() > 0) {
            this.gridObj.children.forEach(child => {
                child.destroy()
            })
        }
    }
}