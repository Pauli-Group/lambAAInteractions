import { Account } from "./Account";
import { UserOperation } from "./UserOperation";
declare const submitUserOperationViaBundler: (userOp: UserOperation, account: Account) => Promise<void>;
export default submitUserOperationViaBundler;
