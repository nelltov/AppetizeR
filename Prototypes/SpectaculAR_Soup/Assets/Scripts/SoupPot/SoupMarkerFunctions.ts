import { EventManager } from "Scripts/EventManager";

@component
export class SoupMarkerFunctions extends BaseScriptComponent {
    private inSoupCheckPhase: boolean = false
    private hasCheckedSoupThisRound: boolean = false
    private swirlAmountThreshold: number = 0.5    // Has soup swirled enough

    onAwake(): void {
        let startEvent = this.createEvent("OnStartEvent")
        startEvent.bind(() => { this.onStart() })
    }

    onStart() {
        EventManager.ResetGameNetworkEvent.add(() => {
            this.inSoupCheckPhase = false
            this.hasCheckedSoupThisRound = false
        })

        EventManager.CheckSoupNetworkEvent.add(() => {
            this.inSoupCheckPhase = true
        })

        EventManager.UpdateSoupSwirlAmount.add((swirlAmount: number) => {
            if (this.inSoupCheckPhase && !this.hasCheckedSoupThisRound) {
                if (Math.abs(swirlAmount) >= this.swirlAmountThreshold) {
                    EventManager.CheckRecipeLocalEvent.trigger()
                    this.hasCheckedSoupThisRound = true
                } 
            }
        })
    }
}
