import {
  address,
  appendTransactionMessageInstructions,
  assertIsTransactionWithinSizeLimit,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  devnet,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  addSignersToTransactionMessage,
  getProgramDerivedAddress,
  generateKeyPairSigner,
  getAddressEncoder
} from "@solana/kit";

import { getInitializeInstruction, getSubmitTsInstruction } from "./clients/js/src/generated/index";
import wallet from "./my-turbine-wallet.json";
import bs58 from "bs58";

const MPL_CORE_PROGRAM = address("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
const PROGRAM_ADDRESS = address("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM");
const SYSTEM_PROGRAM = address("11111111111111111111111111111111");
const COLLECTION = address("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");

// Import keypair from Turbin3 wallet
const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
console.log(`Turbin3 wallet: ${keypair.address}`);

// Create RPC connections
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const rpcSubscriptions = createSolanaRpcSubscriptions(devnet('wss://api.devnet.solana.com'));

const addressEncoder = getAddressEncoder();

const accountSeeds = [Buffer.from("prereqs"), addressEncoder.encode(keypair.address)];
const [account, _bump] = await getProgramDerivedAddress({
  programAddress: PROGRAM_ADDRESS,
  seeds: accountSeeds
});

console.log(`Prereq account PDA: ${account}`);

// fectch auth
const collectionAccountInfo = await rpc.getAccountInfo(COLLECTION, { encoding: 'base64' }).send();

if (!collectionAccountInfo.value) {
  throw new Error("Collection account not found");
}

const collectionData = Buffer.from(collectionAccountInfo.value.data[0], 'base64');
// Skip discriminator (1 byte), read next 32 bytes as the update authority
const updateAuthorityBytes = collectionData.slice(1, 33);
const authority = address(bs58.encode(updateAuthorityBytes));

console.log(`Collection update authority: ${authority}`);

// Generate mint keypair for the NFT
const mintKeyPair = await generateKeyPairSigner();
console.log(`Mint address: ${mintKeyPair.address}`);

/*
console.log("\n Initializing account \n");

const initializeIx = getInitializeInstruction({
  github: "dakewamama",
  user: keypair,
  account,
  systemProgram: SYSTEM_PROGRAM
});

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const transactionMessageInit = pipe(
  createTransactionMessage({ version: 0 }),
  tx => setTransactionMessageFeePayerSigner(keypair, tx),
  tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  tx => appendTransactionMessageInstructions([initializeIx], tx)
);

const signedTxInit = await signTransactionMessageWithSigners(transactionMessageInit);
assertIsTransactionWithinSizeLimit(signedTxInit);

const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

try {
  await sendAndConfirmTransaction(
    signedTxInit,
    { commitment: 'confirmed', skipPreflight: false }
  );
  const signatureInit = getSignatureFromTransaction(signedTxInit);
  console.log(`Initialize Success! Check out your TX here:
https://explorer.solana.com/tx/${signatureInit}?cluster=devnet`);
} catch (e) {
  console.error(`Oops, something went wrong: ${e}`);
}
*/


console.log("\n Submitting TypeScript completion \n");

// Fetch a fresh blockhash
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

// Use the ASYNC version which auto-derives some PDAs
const submitIx = getSubmitTsInstruction({
  user: keypair,
  account,
  mint: mintKeyPair,
  collection: COLLECTION,
  authority: authority, 
  mplCoreProgram: MPL_CORE_PROGRAM,
  systemProgram: SYSTEM_PROGRAM
});

const transactionMessageSubmit = pipe(
  createTransactionMessage({ version: 0 }),
  tx => setTransactionMessageFeePayerSigner(keypair, tx),
  tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  tx => appendTransactionMessageInstructions([submitIx], tx),
  tx => addSignersToTransactionMessage([mintKeyPair], tx)
);

const signedTxSubmit = await signTransactionMessageWithSigners(transactionMessageSubmit);
assertIsTransactionWithinSizeLimit(signedTxSubmit);

const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

try {
  await sendAndConfirmTransaction(
    signedTxSubmit,
    { commitment: 'confirmed', skipPreflight: false }
  );
  const signatureSubmit = getSignatureFromTransaction(signedTxSubmit);
  console.log(`Submit Success! Check out your TX here:
https://explorer.solana.com/tx/${signatureSubmit}?cluster=devnet`);
  console.log(`\nCongratulations! You've completed the Turbin3 TypeScript Prerequisites!`);
} catch (e) {
  console.error(`Oops, something went wrong:`, e);
  if (e instanceof Error) {
    console.error('Error message:', e.message);
  }
}