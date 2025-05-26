const player = game.GetService("Players").LocalPlayer;

const EmoteGui = player.WaitForChild("PlayerGui").WaitForChild("EmoteGui") as ScreenGui;

const EmoteButton = EmoteGui.WaitForChild("EmoteButton") as TextButton;

