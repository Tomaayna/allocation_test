export interface Vehicle {
    id: string;
    name: string;
    department: string;
    status: "出庫中" | "入庫中" | "修理・点検";
    weightLimit?: number;
    plateNo?: string;
    createdAt?: any;
}
type NewVehicle = Omit<Vehicle, "id" | "createdAt">;
export declare const vehiclesToCsv: (list: Vehicle[]) => Blob;
export declare const importVehiclesCsv: (file: File) => Promise<void>;
export declare const useVehicles: () => {
    vehicles: Vehicle[];
    updateStatus: (id: string, status: Vehicle["status"]) => Promise<void>;
    createVehicle: (data: NewVehicle) => Promise<void>;
    updateVehicle: (id: string, patch: Partial<NewVehicle>) => Promise<void>;
    removeVehicle: (id: string) => Promise<void>;
};
export {};
