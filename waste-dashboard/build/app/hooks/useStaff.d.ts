export type StaffStatus = "出勤" | "休暇";
/** スタッフ 1 人分の Firestore ドキュメント */
export interface Staff {
    id: string;
    name: string;
    department: string;
    status: StaffStatus;
    /** 保有免許リスト（例: ["大型", "クレーン"]） */
    license: string[];
}
export declare const useStaff: () => {
    staff: Staff[];
    updateStatus: (id: string, status: StaffStatus) => Promise<void>;
    addLicense: (id: string, lic: string) => Promise<void>;
    removeLicense: (id: string, lic: string) => Promise<void>;
};
