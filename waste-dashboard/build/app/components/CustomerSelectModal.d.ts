import type { Customer } from "../types";
interface Props {
    customers: Customer[];
    onSelect: (c: Customer) => void;
    onClose: () => void;
}
export default function CustomerSelectModal({ customers, onSelect, onClose, }: Props): import("react/jsx-runtime").JSX.Element;
export {};
