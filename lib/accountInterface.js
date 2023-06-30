"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const accountInterface = new ethers_1.ethers.utils.Interface([
    "function execute(address dest, uint256 value, bytes calldata func)",
    "function addPublicKeyHashes(bytes32[] memory publicKeyHashesToAdd)",
    "function removePublicKeyHashes(bytes32[] memory publicKeyHashesToRemove)",
    "function togglePause()",
    "function asyncTransfer(address dest, uint256 value)",
    "function setExtensionContract(bytes32 extensionId, address extensionAddress)",
    "function endorseMessage(bytes32 message)",
    "function isValidSignature(bytes32 hash, bytes memory missing)",
    "function executeBatch(address[] calldata dest, bytes[] calldata func)",
    "function nonce() returns (uint256)",
    "function entryPoint() view returns (address)",
    "function liveKeyCount() view returns (uint256)",
    "function initializePullPaymentsAndERC777Support()",
    "function executeBatchWithValue(address[] calldata dest, uint256[] calldata value,  bytes[] calldata func)",
    "function endorseMerkleRoot(bytes32 merkleRoot)",
    "function initialize( address anOwner, bytes32[] memory firstLamportKeys)"
]);
exports.default = accountInterface;
