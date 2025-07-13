interface Props {
    onAdd: (stop: {
        lat: number;
        lng: number;
        address: string;
        client: string;
        time: string;
    }) => void;
}
export default function AddressInput({ onAdd }: Props): import("react/jsx-runtime").JSX.Element;
export {};
