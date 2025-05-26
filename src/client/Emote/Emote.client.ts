import { Emote, EmoteData } from "shared/Emote";

const Players = game.GetService("Players");
const RunService = game.GetService("RunService");
const SoundService = game.GetService("SoundService");
const ReplicatedStorage = game.GetService("ReplicatedStorage");
const player = Players.LocalPlayer;

const EmoteGui = player.WaitForChild("PlayerGui").WaitForChild("EmoteGui") as ScreenGui;
const frame = EmoteGui.WaitForChild("Frame") as Frame;
const EmoteButton = frame.WaitForChild("EmoteButton") as TextButton;

const playEmoteRemote = ReplicatedStorage.WaitForChild("PlayEmoteRemote") as RemoteEvent;
const stopEmoteRemote = ReplicatedStorage.WaitForChild("StopEmoteRemote") as RemoteEvent;

let currentEmoteTrack: AnimationTrack | undefined;
let currentEmoteMusic: Sound | undefined;
let movementConnection: RBXScriptConnection | undefined;

const otherPlayersEmotes = new Map<Player, { track?: AnimationTrack; music?: Sound }>();

function createEmoteButtons() {
    const emotesList = Emote.EmotesList;
    
    for (const child of frame.GetChildren()) {
        if (child.IsA("TextButton") && child !== EmoteButton) {
            child.Destroy();
        }
    }
    
    let buttonIndex = 0;
    
    for (const [emoteName, emoteData] of pairs(emotesList)) {
        const button = EmoteButton.Clone();
        button.Name = `EmoteButton_${emoteName}`;
        button.Text = emoteName;
        button.Visible = true;
        button.Parent = frame;

        button.MouseButton1Click.Connect(() => {
            playEmote(emoteName);
        });
        
        buttonIndex++;
    }

    EmoteButton.Visible = false;
}

function playEmote(emoteName: string) {
    const emoteData = Emote.GetEmoteData(emoteName);
    
    if (!emoteData) {
        warn(`Emote "${emoteName}" not found!`);
        return;
    }
    
    // Play locally first
    playEmoteLocal(emoteName, emoteData);
    
    // Tell other clients to play this emote
    playEmoteRemote.FireServer(emoteName);
}

function playEmoteLocal(emoteName: string, emoteData: EmoteData) {
    const character = player.Character;
    if (!character) {
        warn("Character not found!");
        return;
    }
    
    const humanoid = character.FindFirstChild("Humanoid") as Humanoid;
    const animator = humanoid.FindFirstChild("Animator") as Animator;

    stopCurrentEmote();

    const emoteAnimation = new Instance("Animation");
    emoteAnimation.AnimationId = emoteData.animationId;
    
    currentEmoteTrack = animator.LoadAnimation(emoteAnimation);
    currentEmoteTrack.Play();
    
    if (emoteData.musicId) {
        playEmoteMusic(emoteData.musicId, emoteData.musicVolume || 0.5);
    }

    setupMovementCancellation(character, humanoid);
    
    currentEmoteTrack.Ended.Connect(() => {
        stopCurrentEmote();
        // Tell other clients we stopped
        stopEmoteRemote.FireServer();
    });
    
    print(`local. emote: ${emoteName}`);
}

function playEmoteForOtherPlayer(otherPlayer: Player, emoteName: string) {
    const emoteData = Emote.GetEmoteData(emoteName);
    if (!emoteData) return;
    
    const character = otherPlayer.Character;
    if (!character) return;
    
    const humanoid = character.FindFirstChild("Humanoid") as Humanoid;
    const animator = humanoid.FindFirstChild("Animator") as Animator;
    if (!humanoid || !animator) return;
    
    // Stop any existing emote for this player
    stopEmoteForOtherPlayer(otherPlayer);
    
    // Play animation
    const emoteAnimation = new Instance("Animation");
    emoteAnimation.AnimationId = emoteData.animationId;
    
    const track = animator.LoadAnimation(emoteAnimation);
    track.Play();
    
    // Play music from their character
    let music: Sound | undefined;
    if (emoteData.musicId) {
        const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart;
        if (rootPart) {
            music = new Instance("Sound");
            music.SoundId = emoteData.musicId;
            music.Volume = emoteData.musicVolume || 0.5;
            music.Looped = true;
            music.RollOffMinDistance = 10;
            music.RollOffMaxDistance = 50;
            music.Parent = rootPart; // Play from their character position
            music.Play();
        }
    }
    
    // Store the emote data
    otherPlayersEmotes.set(otherPlayer, { track, music });
    
    // Clean up when animation ends naturally
    track.Ended.Connect(() => {
        stopEmoteForOtherPlayer(otherPlayer);
    });
    
    print(`Playing emote "${emoteName}" for player: ${otherPlayer.Name}`);
}

function stopEmoteForOtherPlayer(otherPlayer: Player) {
    const emoteData = otherPlayersEmotes.get(otherPlayer);
    if (!emoteData) return;
    
    if (emoteData.track) {
        emoteData.track.Stop();
    }
    
    if (emoteData.music) {
        emoteData.music.Stop();
        emoteData.music.Destroy();
    }
    
    otherPlayersEmotes.delete(otherPlayer);
    print(`Stopped emote for player: ${otherPlayer.Name}`);
}

function playEmoteMusic(musicId: string, volume: number) {
    currentEmoteMusic = new Instance("Sound");
    currentEmoteMusic.SoundId = musicId;
    currentEmoteMusic.Volume = volume;
    currentEmoteMusic.Looped = true;
    currentEmoteMusic.Parent = SoundService;
    currentEmoteMusic.RollOffMinDistance = 10;
    currentEmoteMusic.RollOffMaxDistance = 50;

    currentEmoteMusic.Play();

    currentEmoteMusic.Ended.Connect(() => {
        if (currentEmoteMusic && !currentEmoteMusic.Looped) {
            currentEmoteMusic.Destroy();
            currentEmoteMusic = undefined;
        }
    });
    
    print(`local. song: ${musicId}`);
}

function setupMovementCancellation(character: Model, humanoid: Humanoid) {
    const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart;
    if (!rootPart) return;

    if (movementConnection) {
        movementConnection.Disconnect();
    }
    
    movementConnection = RunService.Heartbeat.Connect(() => {
        const velocity = rootPart.AssemblyLinearVelocity;
        const moveDirection = humanoid.MoveDirection;
        
        if (velocity.Magnitude > 0.5 || moveDirection.Magnitude > 0.1) {
            stopCurrentEmote();
            // Tell other clients we stopped
            stopEmoteRemote.FireServer();
            print("local. cancelled due to movement");
        }
    });
}

function stopCurrentEmote() {
    if (currentEmoteTrack) {
        currentEmoteTrack.Stop();
        currentEmoteTrack = undefined;
    }

    if (currentEmoteMusic) {
        currentEmoteMusic.Stop();
        currentEmoteMusic.Destroy();
        currentEmoteMusic = undefined;
    }

    if (movementConnection) {
        movementConnection.Disconnect();
        movementConnection = undefined;
    }
}

// Listen for other players' emotes
playEmoteRemote.OnClientEvent.Connect((otherPlayer: Player, emoteName: string) => {
    playEmoteForOtherPlayer(otherPlayer, emoteName);
});

stopEmoteRemote.OnClientEvent.Connect((otherPlayer: Player) => {
    stopEmoteForOtherPlayer(otherPlayer);
});

// Clean up when players leave
Players.PlayerRemoving.Connect((leavingPlayer) => {
    stopEmoteForOtherPlayer(leavingPlayer);
});

function onCharacterAdded(character: Model) {
    stopCurrentEmote();
    task.wait(1);
    createEmoteButtons();
}

// Clean up when character respawns
player.CharacterAdded.Connect((character) => {
    // Clean up other players' emotes when our character respawns
    for (const [otherPlayer] of pairs(otherPlayersEmotes)) {
        stopEmoteForOtherPlayer(otherPlayer);
    }
    onCharacterAdded(character);
});

// Clean up other players' emotes when they respawn
Players.PlayerAdded.Connect((newPlayer) => {
    newPlayer.CharacterAdded.Connect(() => {
        stopEmoteForOtherPlayer(newPlayer);
    });
});

if (player.Character) {
    onCharacterAdded(player.Character);
}

script.Destroying.Connect(() => {
    stopCurrentEmote();
    // Clean up all other players' emotes
    for (const [otherPlayer] of pairs(otherPlayersEmotes)) {
        stopEmoteForOtherPlayer(otherPlayer);
    }
});

createEmoteButtons();