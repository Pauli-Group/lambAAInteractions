import { BytesLike } from "ethers";
import { Account } from "./Account";
export default function getInitCode(account: Account): Promise<BytesLike>;
