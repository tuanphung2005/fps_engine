import { ShiftlockState } from "shared/PlayerModule";

const Players = game.GetService("Players");
const RunService = game.GetService("RunService");
const player = Players.LocalPlayer;
const workspace = game.GetService("Workspace");

let RangeOfMotion = 45;
let RangeOfMotionTorso = 90 - RangeOfMotion;
let RangeOfMotionXZ = RangeOfMotion / 140;
const LerpSpeed = 0.005;

RangeOfMotion = math.rad(RangeOfMotion);
RangeOfMotionTorso = math.rad(RangeOfMotionTorso);
RangeOfMotionXZ = math.rad(5)//RangeOfMotion / 200;

let RootJointOriginalC0: CFrame;
let NeckOriginalC0: CFrame;
let RightHipOriginalC0: CFrame;
let LeftHipOriginalC0: CFrame;

const PlayersTable: Player[] = [];

function Calculate(
    dt: number,
    HumanoidRootPart: BasePart,
    Humanoid: Humanoid,
    Torso: BasePart,
) {
    const rightHip = Torso.FindFirstChild("Right Hip") as Motor6D;
    const leftHip = Torso.FindFirstChild("Left Hip") as Motor6D;
    const rootJoint = HumanoidRootPart.FindFirstChild("RootJoint") as Motor6D;
    const neck = Torso.FindFirstChild("Neck") as Motor6D;

    if (
        !rightHip || !leftHip || !rootJoint || !neck ||
        !RootJointOriginalC0 || !NeckOriginalC0 || !RightHipOriginalC0 || !LeftHipOriginalC0
    ) {
        return;
    }

    const directionOfMovement = HumanoidRootPart.CFrame.VectorToObjectSpace(HumanoidRootPart.AssemblyLinearVelocity);
    const normalizedDirection = new Vector3(
        directionOfMovement.X / Humanoid.WalkSpeed,
        0,
        directionOfMovement.Z / Humanoid.WalkSpeed,
    );

    let XResult = normalizedDirection.X * (RangeOfMotion - (math.abs(normalizedDirection.Z) * (RangeOfMotion / 2)));
    let XResultTorso =
        normalizedDirection.X *
        (RangeOfMotionTorso - math.abs(normalizedDirection.Z) * (RangeOfMotionTorso / 2));
    let XResultXZ =
        normalizedDirection.X * (RangeOfMotionXZ - math.abs(normalizedDirection.Z) * (RangeOfMotionXZ / 2));

    if (normalizedDirection.Z > 0.1) {
        XResult *= -1;
        XResultTorso *= -1;
        XResultXZ *= -1;
    }

    const RightHipResult = RightHipOriginalC0
        .mul(new CFrame(-XResultXZ, 0, -math.abs(XResultXZ) + math.abs(-XResultXZ)))
        .mul(CFrame.Angles(0, -XResult, 0));
    const LeftHipResult = LeftHipOriginalC0
        .mul(new CFrame(-XResultXZ, 0, -math.abs(-XResultXZ) + math.abs(-XResultXZ)))
        .mul(CFrame.Angles(0, -XResult, 0));
    const RootJointResult = RootJointOriginalC0.mul(CFrame.Angles(0, 0, -XResultTorso));
    const NeckResult = NeckOriginalC0.mul(CFrame.Angles(0, 0, XResultTorso));

    const LerpTime = 1 - LerpSpeed ** dt;

    rightHip.C0 = rightHip.C0.Lerp(RightHipResult, LerpTime);
    leftHip.C0 = leftHip.C0.Lerp(LeftHipResult, LerpTime);
    rootJoint.C0 = rootJoint.C0.Lerp(RootJointResult, LerpTime);
    neck.C0 = neck.C0.Lerp(NeckResult, LerpTime);
}

function setupOriginalC0s() {
    const character = player.Character;
    if (!character) return;
    const humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;
    const torso = character.WaitForChild("Torso") as BasePart;

    const rootJoint = humanoidRootPart.FindFirstChild("RootJoint") as Motor6D;
    const neck = torso.FindFirstChild("Neck") as Motor6D;
    const rightHip = torso.FindFirstChild("Right Hip") as Motor6D;
    const leftHip = torso.FindFirstChild("Left Hip") as Motor6D;

    if (!rootJoint || !neck || !rightHip || !leftHip) return;

    RootJointOriginalC0 = rootJoint.C0;
    NeckOriginalC0 = neck.C0;
    RightHipOriginalC0 = rightHip.C0;
    LeftHipOriginalC0 = leftHip.C0;
}

RunService.RenderStepped.Connect((dt) => {

    for (const Player of Players.GetPlayers()) {
        if (!Player.Character) continue;
        if (PlayersTable.includes(Player)) continue;
        PlayersTable.push(Player);
    }


    for (let i = PlayersTable.size() - 1; i >= 0; i--) {
        const Player = PlayersTable[i];
        if (!Player) {
            PlayersTable.remove(i);
            continue;
        }
        if (!Players.FindFirstChild(Player.Name)) {
            PlayersTable.remove(i);
            continue;
        }
        if (!Player.Character) {
            PlayersTable.remove(i);
            continue;
        }
        const HumanoidRootPart = Player.Character.FindFirstChild("HumanoidRootPart") as BasePart;
        const Humanoid = Player.Character.FindFirstChild("Humanoid") as Humanoid;
        const Torso = Player.Character.FindFirstChild("Torso") as BasePart;
        if (!HumanoidRootPart || !Humanoid || !Torso) continue;

        if (Player === player) {
            const camera = workspace.CurrentCamera as Camera;
            const shiftlock = ShiftlockState.IsEnabled();
            const humanoid = Humanoid;

            if (shiftlock) {
                humanoid.AutoRotate = false;
                const camYaw = (() => {
                    const [, y] = camera.CFrame.ToEulerAnglesYXZ();
                    return math.deg(y);
                })();
                const torsoYaw = (() => {
                    const [, y] = HumanoidRootPart.CFrame.ToEulerAnglesYXZ();
                    return math.deg(y);
                })();
                const newTorsoYaw = (() => {
                    const diff = ((camYaw - torsoYaw + 180) % 360) - 180;
                    return torsoYaw + diff * 0.15;
                })();
                HumanoidRootPart.CFrame = new CFrame(HumanoidRootPart.Position).mul(CFrame.Angles(0, math.rad(newTorsoYaw), 0));
            } else {
                humanoid.AutoRotate = true;
            }
        }

        Calculate(dt, HumanoidRootPart, Humanoid, Torso);
    }
});

if (player.Character) {
    setupOriginalC0s();
}
player.CharacterAdded.Connect(setupOriginalC0s);