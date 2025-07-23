import { IPositionalConfig } from "./positionalConfig.interface";
export interface IAudioConfig {
    path: string;
    volume?: number;
    loop?: boolean;
    key?: string;
    playOnLoad?: boolean;
    positionalConfig?: IPositionalConfig;
}
