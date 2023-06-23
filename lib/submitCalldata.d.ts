import { bytes } from "./SolidityTypes";
declare const submitCalldata: (_accountName: string, calldata: bytes) => Promise<void>;
export default submitCalldata;
