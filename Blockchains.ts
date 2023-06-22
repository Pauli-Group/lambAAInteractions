import { Blockchain } from "./Blockchain";

export type Blockchains = {
    [chainName: string]: Blockchain,
}