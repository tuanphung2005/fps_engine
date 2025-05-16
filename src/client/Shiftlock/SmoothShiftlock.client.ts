import { PlayerModule } from "shared/PlayerModule";
import { ShiftlockState } from "shared/PlayerModule";

const RunService = game.GetService("RunService");
const Players = game.GetService("Players");
const UserInputService = game.GetService("UserInputService");
const ContextActionService = game.GetService("ContextActionService");

const player = Players.LocalPlayer;
const workspace = game.GetService("Workspace");

const TOGGLE_KEY = PlayerModule.ShiftlockKey;
const CAMERA_OFFSET = new Vector3(2, 0, 0);
const TRANSITION_SPEED = 10;

let isShiftlockEnabled = false;
let currentOffset = new Vector3(0, 0, 0);
let targetOffset = new Vector3(0, 0, 0);
let character: Model | undefined;
let humanoid: Humanoid | undefined;
let rootPart: BasePart | undefined;
let originalMouseBehavior = UserInputService.MouseBehavior;


function toggleShiftlock() {
    isShiftlockEnabled = !isShiftlockEnabled;
    ShiftlockState.SetEnabled(isShiftlockEnabled);
    
    if (isShiftlockEnabled) {
        targetOffset = CAMERA_OFFSET;
        UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
        
    } else {
        targetOffset = new Vector3(0, 0, 0);
        UserInputService.MouseBehavior = originalMouseBehavior;

    }
}

function applyCameraEffects() {
    const camera = workspace.CurrentCamera as Camera;
    if (!camera || !character || !humanoid || humanoid.Health <= 0) {
        return;
    }

    if (isShiftlockEnabled || currentOffset.Magnitude > 0.01) {
        const [dt] = RunService.RenderStepped.Wait();
        currentOffset = currentOffset.Lerp(targetOffset, dt * TRANSITION_SPEED);
    }

    if (currentOffset.Magnitude > 0.01) {
        camera.CFrame = camera.CFrame.mul(new CFrame(currentOffset));
    }
}

function onCharacterAdded(newCharacter: Model) {
    character = newCharacter;
    humanoid = character.WaitForChild("Humanoid") as Humanoid;
    rootPart = character.WaitForChild("HumanoidRootPart") as BasePart;

    if (isShiftlockEnabled) {
        isShiftlockEnabled = false;
        toggleShiftlock();
    }
}

function handleShiftlockInput(actionName: string, inputState: Enum.UserInputState, inputObject: InputObject) {
    if (inputState === Enum.UserInputState.Begin) {
        toggleShiftlock();
    }
    return Enum.ContextActionResult.Sink;
}

player.CharacterAdded.Connect(onCharacterAdded);
ContextActionService.BindAction("ToggleShiftlock", handleShiftlockInput, true, TOGGLE_KEY);

// mobile input
ContextActionService.SetTitle("ToggleShiftlock", "Shiftlock");
//ContextActionService.SetPosition("ToggleShiftlock", UDim2.fromScale(0.5, 0.5));

originalMouseBehavior = UserInputService.MouseBehavior;

if (player.Character) {
    onCharacterAdded(player.Character);
}

RunService.BindToRenderStep(
    "CustomCameraEffects", 
    Enum.RenderPriority.Camera.Value + 1, 
    applyCameraEffects
);

script.Destroying.Connect(() => {
    RunService.UnbindFromRenderStep("CustomCameraEffects");
    ContextActionService.UnbindAction("ToggleShiftlock");
    
    if (isShiftlockEnabled) {
        UserInputService.MouseBehavior = originalMouseBehavior;
    }

});