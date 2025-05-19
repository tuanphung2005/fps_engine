export class PlayerModule {
    static WalkAnimationId = "rbxassetid://100518044227402";
    static IdleAnimationId = "rbxassetid://122386052443389";
    static IdleAnimationIdLong = "rbxassetid://122386052443389";

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