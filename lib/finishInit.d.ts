import { address, bytes, uint256 } from "./SolidityTypes";
type ExtraActivities = {
    dest: address[];
    value: uint256[];
    func: bytes[];
    estimatedAdditionalGas: uint256;
};
declare const finishInit: (_accountName: string, depositAmount: string, extraActivities?: ExtraActivities | null) => Promise<void>;
export default finishInit;
export type { ExtraActivities };
