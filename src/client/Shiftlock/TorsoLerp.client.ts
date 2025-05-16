import { ShiftlockState } from "shared/PlayerModule";

const Players = game.GetService("Players");
const RunService = game.GetService("RunService");
const player = Players.LocalPlayer;
const workspace = game.GetService("Workspace");

const TORSO_LERP_SPEED = 0.15;

function getYaw(cf: CFrame) {
    const [, y] = cf.ToEulerAnglesYXZ();
    return math.deg(y);
}

function lerpAngle(a: number, b: number, t: number) {
    const diff = ((b - a + 180) % 360) - 180;
    return a + diff * t;
}

function setupFancyHead(character: Model) {
    const humanoid = character.WaitForChild("Humanoid") as Humanoid;
    const root = character.WaitForChild("HumanoidRootPart") as BasePart;
    const camera = workspace.CurrentCamera as Camera;

    let lastShiftlock = ShiftlockState.IsEnabled();

    RunService.RenderStepped.Connect(() => {
        const shiftlock = ShiftlockState.IsEnabled();

        if (shiftlock !== lastShiftlock) {
            humanoid.AutoRotate = !shiftlock;
            lastShiftlock = shiftlock;
        }

        if (!shiftlock) return;

        const camYaw = getYaw(camera.CFrame);
        const torsoYaw = getYaw(root.CFrame);

        const newTorsoYaw = lerpAngle(torsoYaw, camYaw, TORSO_LERP_SPEED);
        root.CFrame = new CFrame(root.Position).mul(CFrame.Angles(0, math.rad(newTorsoYaw), 0));
    });
}

if (player.Character) {
    setupFancyHead(player.Character);
}
player.CharacterAdded.Connect(setupFancyHead);