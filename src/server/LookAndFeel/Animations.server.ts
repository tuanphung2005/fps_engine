const player = game.GetService("Players")
import { PlayerModule } from "shared/PlayerModule";

const WalkAnimationId = PlayerModule.WalkAnimationId;
const IdleAnimationId = PlayerModule.IdleAnimationId;
const IdleAnimationIdLong = PlayerModule.IdleAnimationIdLong;

player.PlayerAdded.Connect((plr) => {
    plr.CharacterAdded.Connect((char) => {
        const WalkId = char.WaitForChild("Animate").WaitForChild("walk").WaitForChild("WalkAnim") as Animation;
        const IdleId = char.WaitForChild("Animate").WaitForChild("idle").WaitForChild("Animation1") as Animation;
        const IdleIdLong = char.WaitForChild("Animate").WaitForChild("idle").WaitForChild("Animation2") as Animation;
        
        WalkId.AnimationId = WalkAnimationId;
        IdleId.AnimationId = IdleAnimationId;
        IdleIdLong.AnimationId = IdleAnimationIdLong;

    })
})