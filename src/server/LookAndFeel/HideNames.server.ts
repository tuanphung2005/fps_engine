const playerService = game.GetService("Players");

playerService.PlayerAdded.Connect((player) => {
    player.CharacterAdded.Connect((character) => {
        const humanoid = character.WaitForChild("Humanoid") as Humanoid;
        humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None;   
    })
})