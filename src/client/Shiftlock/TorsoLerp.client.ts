import { ShiftlockState } from "shared/PlayerModule";

const Players = game.GetService("Players");
const RunService = game.GetService("RunService");
const player = Players.LocalPlayer;
const workspace = game.GetService("Workspace");

const TORSO_LERP_SPEED = 0.15;
const DIRECTION_LERP_SPEED = 0.005;
const RANGE_OF_MOTION = math.rad(45);
const RANGE_OF_MOTION_TORSO = math.rad(90 - 45);
const RANGE_OF_MOTION_XZ = 45 / 140;

let rootJointOriginalC0: CFrame;
let neckOriginalC0: CFrame;
let rightHipOriginalC0: CFrame;
let leftHipOriginalC0: CFrame;

function getYaw(cf: CFrame) {
    const [, y] = cf.ToEulerAnglesYXZ();
    return math.deg(y);
}

function lerpAngle(a: number, b: number, t: number) {
    const diff = ((b - a + 180) % 360) - 180;
    return a + diff * t;
}

interface CharacterJoints {
    rootJoint: Motor6D | undefined;
    neck: Motor6D | undefined;
    rightHip: Motor6D | undefined;
    leftHip: Motor6D | undefined;
}

function getJoints(character: Model): CharacterJoints {
    const joints: CharacterJoints = {
        rootJoint: undefined,
        neck: undefined,
        rightHip: undefined,
        leftHip: undefined
    };

    const humanoidRootPart = character.FindFirstChild("HumanoidRootPart") as BasePart;
    const torso = character.FindFirstChild("Torso") as BasePart;

    if (humanoidRootPart && torso) {
        joints.rootJoint = humanoidRootPart.FindFirstChild("RootJoint") as Motor6D;
        joints.neck = torso.FindFirstChild("Neck") as Motor6D;
        joints.rightHip = torso.FindFirstChild("Right Hip") as Motor6D;
        joints.leftHip = torso.FindFirstChild("Left Hip") as Motor6D;
    }

    return joints;
}

function calculateDirectionalMovement(dt: number, root: BasePart, humanoid: Humanoid, joints: CharacterJoints) {

    if (!joints.rootJoint || !joints.neck || !joints.rightHip || !joints.leftHip) return;

    const directionOfMovement = root.CFrame.VectorToObjectSpace(root.AssemblyLinearVelocity);
    const normalizedDirection = new Vector3(
        directionOfMovement.X / humanoid.WalkSpeed,
        0,
        directionOfMovement.Z / humanoid.WalkSpeed
    );

    const xResult = normalizedDirection.X * (RANGE_OF_MOTION - (math.abs(normalizedDirection.Z) * (RANGE_OF_MOTION / 2)));
    const xResultTorso = normalizedDirection.X * (RANGE_OF_MOTION_TORSO - (math.abs(normalizedDirection.Z) * (RANGE_OF_MOTION_TORSO / 2)));
    const xResultXZ = normalizedDirection.X * (RANGE_OF_MOTION_XZ - (math.abs(normalizedDirection.Z) * (RANGE_OF_MOTION_XZ / 2)));

    const finalX = normalizedDirection.Z > 0.1 ? -xResult : xResult;
    const finalXTorso = normalizedDirection.Z > 0.1 ? -xResultTorso : xResultTorso;
    const finalXXZ = normalizedDirection.Z > 0.1 ? -xResultXZ : xResultXZ;

    const rightHipResult = rightHipOriginalC0
        .mul(new CFrame(-finalXXZ, 0, -math.abs(finalXXZ) + math.abs(-finalXXZ)))
        .mul(CFrame.Angles(0, -finalX, 0));
        
    const leftHipResult = leftHipOriginalC0
        .mul(new CFrame(-finalXXZ, 0, -math.abs(-finalXXZ) + math.abs(-finalXXZ)))
        .mul(CFrame.Angles(0, -finalX, 0));
        
    const rootJointResult = rootJointOriginalC0.mul(CFrame.Angles(0, 0, -finalXTorso));
    const neckResult = neckOriginalC0.mul(CFrame.Angles(0, 0, finalXTorso));

    const lerpTime = 1 - math.pow(DIRECTION_LERP_SPEED, dt);
    
    joints.rightHip.C0 = joints.rightHip.C0.Lerp(rightHipResult, lerpTime);
    joints.leftHip.C0 = joints.leftHip.C0.Lerp(leftHipResult, lerpTime);
    joints.rootJoint.C0 = joints.rootJoint.C0.Lerp(rootJointResult, lerpTime);
    joints.neck.C0 = joints.neck.C0.Lerp(neckResult, lerpTime);
}

function setupFancyHead(character: Model) {
    const humanoid = character.WaitForChild("Humanoid") as Humanoid;
    const root = character.WaitForChild("HumanoidRootPart") as BasePart;
    const camera = workspace.CurrentCamera as Camera;
    
    const joints = getJoints(character);

    if (!joints.rootJoint || !joints.neck || !joints.rightHip || !joints.leftHip) {
        warn("Character doesn't have all required R6 joints");
        return;
    }
    
    rootJointOriginalC0 = joints.rootJoint.C0;
    neckOriginalC0 = joints.neck.C0;
    rightHipOriginalC0 = joints.rightHip.C0;
    leftHipOriginalC0 = joints.leftHip.C0;

    let lastShiftlock = ShiftlockState.IsEnabled();

    RunService.RenderStepped.Connect((dt) => {
        const shiftlock = ShiftlockState.IsEnabled();

        if (shiftlock !== lastShiftlock) {
            humanoid.AutoRotate = !shiftlock;
            lastShiftlock = shiftlock;

            if (!shiftlock) {
                if (joints.rootJoint && joints.neck && joints.rightHip && joints.leftHip) {
                    joints.rootJoint.C0 = rootJointOriginalC0;
                    joints.neck.C0 = neckOriginalC0;
                    joints.rightHip.C0 = rightHipOriginalC0;
                    joints.leftHip.C0 = leftHipOriginalC0;
                }
            }
        }

        if (!shiftlock) return;

        const camYaw = getYaw(camera.CFrame);
        const torsoYaw = getYaw(root.CFrame);
        const newTorsoYaw = lerpAngle(torsoYaw, camYaw, TORSO_LERP_SPEED);
        root.CFrame = new CFrame(root.Position).mul(CFrame.Angles(0, math.rad(newTorsoYaw), 0));
        
        calculateDirectionalMovement(dt, root, humanoid, joints);
    });
}

if (player.Character) {
    setupFancyHead(player.Character);
}

player.CharacterAdded.Connect(setupFancyHead);