export interface RouteSettings {
    startAddress: string;
}
export declare function useRouteSettings(): {
    settings: RouteSettings;
    save: (patch: Partial<RouteSettings>) => Promise<void>;
    loading: boolean;
};
