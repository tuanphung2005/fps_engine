
const playerService = game.GetService("Players");
const player = playerService.LocalPlayer;

player.CharacterAdded.Connect(() => {
    const WatermarkGui = player.WaitForChild("PlayerGui").WaitForChild("Watermark") as ScreenGui;
    const text = WatermarkGui.WaitForChild("Text") as TextLabel;
    text.Visible = true;
})