/**
 * Specs Inc. 2026
 * ImageScrollList – programmatic vertical scroll list driven by a texture array.
 * Drop on any SceneObject, assign textures, a scrollable list builds itself at runtime.
 * No prefabs, no scene setup, no extra assignments.
 */
import { ScrollWindow } from "SpectaclesUIKit.lspkg/Scripts/Components/ScrollWindow/ScrollWindow";
import { GridLayout, LayoutDirection } from "SpectaclesUIKit.lspkg/Scripts/Components/GridLayout/GridLayout";


// ── Layout constants (world units / cm) ──────────────────────────────────────
const ITEM_W = 1  // width of each row
const ITEM_H = 1   // height of each row (with some buffer for spacing)
const WIN_H  = 10  // visible viewport height (shows 10 items at once maximum)

@component
export class CustomImageScrollList extends BaseScriptComponent {

    @input
    imagePrefab: ObjectPrefab;

    // Runtime objects
    private scrollComp: ScrollWindow;
    private gridObj: SceneObject;
    private gridComp: GridLayout;

    onAwake(): void {
        this.createEvent("OnStartEvent").bind(this.onStart.bind(this));
    }

    onStart(): void {
        if (!this.imagePrefab) {
            print("ImageScrollList: no image prefab assigned - nothing to build.");
            return;
        }
        this.buildScrollWindow(8);
    }

    // ── Build hierarchy ───────────────────────────────────────────────────────

    // Adapting ImageScrollList to spawn image prefabs (don't need the scroll window, but just disabling scrolling rather than removing it)
    private buildScrollWindow(rows: number): void {
        // ScrollWindow – the masked, scrollable viewport
        const scrollObj = global.scene.createSceneObject("Scroll");
        scrollObj.setParent(this.sceneObject);

        this.scrollComp = scrollObj.createComponent(ScrollWindow.getTypeName()) as ScrollWindow;
        this.scrollComp.vertical   = false;
        this.scrollComp.horizontal = false;
        this.scrollComp.windowSize = new vec2(ITEM_W, WIN_H);
        
        // Placeholder; the real value is written after items are created
        this.scrollComp.scrollDimensions = new vec2(ITEM_W, WIN_H + 1);

        // GridLayout container – created now so ScrollWindow.initialize() moves
        // it into its internal Scroller object for us automatically
        this.gridObj = global.scene.createSceneObject("Grid");
        this.gridObj.setParent(scrollObj);

        this.gridComp = this.gridObj.createComponent(GridLayout.getTypeName()) as GridLayout;
        this.gridComp.columns  = 1;
        this.gridComp.rows     = rows;
        this.gridComp.cellSize = new vec2(ITEM_W, ITEM_H);
        this.gridComp.layoutBy = LayoutDirection.Row;
        this.gridComp.cellPadding = new vec4(0.05, 0.05, 0.05, 0.05);

        // onInitialized is a ReplayEvent: fires immediately if already init'd,
        // otherwise fires when ScrollWindow's OnStartEvent runs next frame
        this.scrollComp.onInitialized.add(() => this.buildItems(rows));
    }

    private buildItems(rows: number): void {
        const count = rows;

        for (let i = 0; i < count; i++) {
            this.imagePrefab.instantiate(this.gridObj) 
        }

        // Sync rows to actual item count (may differ from constructor default)
        this.gridComp.rows = count;

        // Defer one tick so every child is registered before layout runs
        const ev = this.createEvent("DelayedCallbackEvent");
        ev.bind(() => {
            this.gridComp.layout();
            this.setScrollDimensions(count);
        });
        ev.reset(0);
    }

    private setScrollDimensions(count: number): void {
        const totalH = count * ITEM_H;
        // scrollDimensions.y must be strictly > windowSize.y to enable scrolling
        const scrollH = Math.max(WIN_H + 0.02, totalH);
        this.scrollComp.scrollDimensions = new vec2(ITEM_W, scrollH);
        // Start at the top of the list
        if (totalH > WIN_H) {
            this.scrollComp.scrollPositionNormalized = new vec2(0, 1);
        }
    }
}