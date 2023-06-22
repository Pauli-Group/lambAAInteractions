import 'dotenv/config';
import { address } from "./SolidityTypes";
import { Blockchain } from "./Blockchain";
export default function generateNewCounterfactual(blockchain: Blockchain, accountName: string): Promise<address>;
