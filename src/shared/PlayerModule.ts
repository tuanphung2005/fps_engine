export class PlayerModule {
    static WalkAnimationId = "rbxassetid://urid";
    static IdleAnimationId = "rbxassetid://urid";
    static IdleAnimationIdLong = "rbxassetid://urid";
    static RunAnimationId = "rbxassetid://urid";
    static JumpAnimationId = "rbxassetid://urid";
    static FallAnimationId = "rbxassetid://urid";

    static WalkSpeed = 7;
    static RunSpeed = 16;

    static ShiftlockKey = Enum.KeyCode.V;
}

export class ShiftlockState {
    private static enabled = false;
    static IsEnabled() {
        return this.enabled;
    }
    static SetEnabled(state: boolean) {
        this.enabled = state;
    }
}