@component
export class InstructionManager extends BaseScriptComponent {
   
    private currentInstruction : number =0;

    @input
    public instructionArray : string[];

    @input
    public instructionHolderObject : SceneObject;
   
    onAwake() {

    }

    private nextInstruction()
    {
        this.currentInstruction++;
    
        if (this.currentInstruction >= this.instructionArray.length)
        {
            this.currentInstruction = this.instructionArray.length - 1;
            this.instructionHolderObject.getComponent("Text").text = "No more ingredients should be added!";
            return;
        }
    
        const currentInstructionDisplayed = this.instructionArray[this.currentInstruction];
        this.instructionHolderObject.getComponent("Text").text = currentInstructionDisplayed;
    }
}
