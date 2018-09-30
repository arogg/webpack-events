
export enum InternalWebpackEvent {
    afterEmit = 'wp_after_emit'
}

export const allInternalWebpackEvents = new Set<string>();
for (const key in InternalWebpackEvent) {
    allInternalWebpackEvents.add(InternalWebpackEvent[key]);
}

export type WebpackEvent = 'rebuilt' | 'built-initial' | 'built';

export const allWebpackEvents = new Set<WebpackEvent>(['rebuilt', 'built-initial', 'built']); 