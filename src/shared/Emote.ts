export interface EmoteData {
    animationId: string;
    musicId?: string;
    musicVolume?: number;
}

export class Emote {
    static EmotesList: Record<string, EmoteData> = {
        "Smug": {
            animationId: "rbxassetid://113925728574334",
            musicId: "rbxassetid://85137437850103",
            musicVolume: 0.5
        },

    };

    static GetEmoteData(emoteName: string): EmoteData | undefined {
        return this.EmotesList[emoteName];
    }

    static GetEmoteId(emoteName: string): string | undefined {
        const emoteData = this.GetEmoteData(emoteName);
        return emoteData?.animationId;
    }
}