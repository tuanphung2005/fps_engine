const player = game.GetService("Players")
import { PlayerModule } from "shared/PlayerModule";

const WalkAnimationId = PlayerModule.WalkAnimationId;
const IdleAnimationId = PlayerModule.IdleAnimationId;
const IdleAnimationIdLong = PlayerModule.IdleAnimationIdLong;
const RunAnimationId = PlayerModule.RunAnimationId;
const JumpAnimationId = PlayerModule.JumpAnimationId;
const FallAnimationId = PlayerModule.FallAnimationId;

player.PlayerAdded.Connect((plr) => {
    plr.CharacterAdded.Connect((char) => {
        const WalkId = char.WaitForChild("Animate").WaitForChild("walk").WaitForChild("WalkAnim") as Animation;
        const IdleId = char.WaitForChild("Animate").WaitForChild("idle").WaitForChild("Animation1") as Animation;
        const IdleIdLong = char.WaitForChild("Animate").WaitForChild("idle").WaitForChild("Animation2") as Animation;
        const RunId = char.WaitForChild("Animate").WaitForChild("run").WaitForChild("RunAnim") as Animation;
        const JumpId = char.WaitForChild("Animate").WaitForChild("jump").WaitForChild("JumpAnim") as Animation;
        const FallId = char.WaitForChild("Animate").WaitForChild("fall").WaitForChild("FallAnim") as Animation;
        
        WalkId.AnimationId = WalkAnimationId;
        IdleId.AnimationId = IdleAnimationId;
        IdleIdLong.AnimationId = IdleAnimationIdLong;
        RunId.AnimationId = RunAnimationId;
        JumpId.AnimationId = JumpAnimationId;
        FallId.AnimationId = FallAnimationId;
    })
})