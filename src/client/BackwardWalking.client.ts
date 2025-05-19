
const Players = game.GetService("Players");
const RunService = game.GetService("RunService");

const player = Players.LocalPlayer;
const REVERSE_THRESHOLD = 0.1;

function setupAnimationReversal(character: Model) {
    const humanoid = character.WaitForChild("Humanoid") as Humanoid;
    const rootPart = character.WaitForChild("HumanoidRootPart") as BasePart;
    const animator = humanoid.FindFirstChildOfClass("Animator") as Animator;
    
    if (!animator) return;
    
    let walkTrack: AnimationTrack | undefined;

    animator.AnimationPlayed.Connect((track) => {
        if (track.Animation) {
            const animId = track.Animation.AnimationId;

            if (string.find(animId, "walk") !== undefined || animId === "rbxassetid://100518044227402") {
                walkTrack = track;
            }
        }
    });
    
    RunService.RenderStepped.Connect(() => {
        if (!walkTrack || !rootPart || !humanoid) return;

        if (!walkTrack.IsPlaying) return;
        
        const moveDirection = rootPart.CFrame.VectorToObjectSpace(humanoid.MoveDirection);
        
        if (moveDirection.Z > REVERSE_THRESHOLD) {
            if (walkTrack.Speed > 0) {
                walkTrack.AdjustSpeed(-math.abs(walkTrack.Speed));
            }
        } else {
            if (walkTrack.Speed < 0) {
                walkTrack.AdjustSpeed(math.abs(walkTrack.Speed));
            }
        }
    });
}

if (player.Character) {
    setupAnimationReversal(player.Character);
}

player.CharacterAdded.Connect(setupAnimationReversal);