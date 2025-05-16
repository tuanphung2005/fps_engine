const Players = game.GetService("Players");
const CUSTOM_STEP_SOUND_ID = "rbxassetid://81623756670923";

function playCustomStepSound(character: Model) {
    const humanoidRootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
    if (humanoidRootPart) {
        let customSound = humanoidRootPart.FindFirstChild("CustomStepSound") as Sound | undefined;
        const pitch = new Instance("PitchShiftSoundEffect");
        if (!customSound) {
            customSound = new Instance("Sound");
            customSound.Name = "CustomStepSound";
            customSound.SoundId = CUSTOM_STEP_SOUND_ID;
            customSound.Looped = false;
            customSound.Parent = humanoidRootPart;

            pitch.Parent = customSound;
        }

        pitch.Octave = 0.7 + (math.random() * (1.2 - 0.7));
        customSound.Volume = 0.7 + (math.random() * (1.2 - 0.7));
        customSound.Play();
    }
}

Players.PlayerAdded.Connect((plr) => {
    plr.CharacterAdded.Connect((character) => {
        const humanoid = character.WaitForChild("Humanoid") as Humanoid;
        const animator = humanoid.FindFirstChildOfClass("Animator") as Animator;
        if (animator) {
            animator.AnimationPlayed.Connect((track) => {
                const stepSignal = track.GetMarkerReachedSignal("Step");
                stepSignal.Connect(() => {
                    playCustomStepSound(character);
                });
            });
        }
    });
});