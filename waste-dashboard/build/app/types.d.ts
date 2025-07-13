export interface Stop {
    id: string;
    customerId: string;
    client: string;
    address: string;
    lat?: number;
    lng?: number;
    order: number;
    time?: string;
    vehicles: string[];
    staff: string[];
}
export type StopCsvRow = {
    order: number;
    client: string;
    address: string;
    time?: string;
    lat?: string | number;
    lng?: string | number;
    vehicleIds?: string;
    staffIds?: string;
};
export interface Customer {
    id: string;
    client: string;
    address: string;
    lat?: number;
    lng?: number;
}
