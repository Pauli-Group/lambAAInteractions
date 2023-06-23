import { address } from "./SolidityTypes";
declare const getDeposit: (adrs: address, chainName: string) => Promise<any>;
export default getDeposit;
