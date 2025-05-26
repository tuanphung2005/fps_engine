const Players = game.GetService("Players");
const player = Players.LocalPlayer;
const Camera = game.GetService("Workspace").CurrentCamera as Camera;

function HeadTracking() {
    const character = player.Character;
    if (character) {
        const head = character.WaitForChild("Head") as BasePart;
        if (head) {
            Camera.CameraSubject = head;
            Camera.CameraType = Enum.CameraType.Custom;
        }
    }
}

HeadTracking();

player.CharacterAdded.Connect((HeadTracking));