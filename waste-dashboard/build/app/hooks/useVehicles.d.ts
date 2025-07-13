export interface Vehicle {
    id: string;
    name: string;
    department: string;
    status: "出庫中" | "入庫中" | "修理・点検";
}
export declare const useVehicles: () => {
    vehicles: Vehicle[];
    updateStatus: (id: string, status: Vehicle["status"]) => Promise<void>;
};
