import Blockchain from "./utils/blockchainUtils/Blockchain.mjs";
import { getKeys, signTransaction } from "./utils/blockchainUtils/helpers.mjs";

const { privateKey, publicKey } = getKeys();
const azaChain = new Blockchain();

const txData = { from: "alice", to: "bob", amount: 20 };
const txString = JSON.stringify(txData);
const signature = signTransaction(txString, privateKey);

azaChain.addTransaction({ ...txData, signature, publicKey });

const tx2 = { from: "bob", to: "carol", amount: 5 };
const tx2String = JSON.stringify(tx2);
const signature2 = signTransaction(tx2String, privateKey);
azaChain.addTransaction({ ...tx2, signature: signature2, publicKey });

azaChain.minePendingTransactions("miner1");

console.log("Balance of miner1:", azaChain.getBalanceOfAddress("miner1"));
console.log("Is chain valid?", azaChain.isChainValid());
