import { Account } from "./Account";
import { uint256 } from "./SolidityTypes";
export default function getNonce(account: Account): Promise<uint256>;
