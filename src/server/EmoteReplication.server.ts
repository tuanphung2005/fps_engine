const Players = game.GetService("Players");
const ReplicatedStorage = game.GetService("ReplicatedStorage");

// Create RemoteEvents for emote replication
const playEmoteRemote = new Instance("RemoteEvent");
playEmoteRemote.Name = "PlayEmoteRemote";
playEmoteRemote.Parent = ReplicatedStorage;

const stopEmoteRemote = new Instance("RemoteEvent");
stopEmoteRemote.Name = "StopEmoteRemote";
stopEmoteRemote.Parent = ReplicatedStorage;

// Server just relays the emote events to all other clients
playEmoteRemote.OnServerEvent.Connect((player, ...args: unknown[]) => {
    const emoteName = args[0] as string;
    // Send to all players except the one who triggered it
    for (const otherPlayer of Players.GetPlayers()) {
        if (otherPlayer !== player) {
            playEmoteRemote.FireClient(otherPlayer, player, emoteName);
        }
    }
});

stopEmoteRemote.OnServerEvent.Connect((player) => {
    // Send to all players except the one who stopped
    for (const otherPlayer of Players.GetPlayers()) {
        if (otherPlayer !== player) {
            stopEmoteRemote.FireClient(otherPlayer, player);
        }
    }
});