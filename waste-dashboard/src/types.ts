export interface Stop {
    id: string;
    customerId: string;
    client: string;
    address: string;
    lat?: number;
    lng?: number;
    order: number;
    time?: string; // HH:mm
    vehicles: string[];
    staff: string[];
  }

  export type StopCsvRow = {
    order: number;        // 1,2,3…
    client: string;
    address: string;
    time?: string;        // 09:30
    lat?: string | number
    lng?: string | number
    vehicleIds?: string;  // "veh01|veh02" 区切り
    staffIds?: string;    // "stf03"
  }

  export interface Customer {
    id: string;
    client: string;
    address: string;
    lat?: number;
    lng?: number;
  }