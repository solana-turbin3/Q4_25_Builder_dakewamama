import wallet from "../turbin3-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey
} from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// 🔹 Your Token Mint Address
const mint = publicKey("GdHGQ9iDfhFXaW845FMFe5xtiTb1d9DHFfDjGsPLZ8vb");

// 🔹 Create UMI connection
const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));

(async () => {
  try {
    // Define the required accounts
    let accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer
    };

    // Define metadata details
    let data: DataV2Args = {
      name: "DAKEC",
      symbol: "$DAKEC",
      uri: "", 
      sellerFeeBasisPoints: 50,
      creators: null,
      collection: null,
      uses: null
    };

    // Define metadata creation arguments
    let args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null
    };

    // Create metadata transaction
    let tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args
    });

    // Send and confirm
    let result = await tx.sendAndConfirm(umi);
    console.log(" Metadata updated!");
    console.log("Signature:", bs58.encode(result.signature));
  } catch (e) {
    console.error(` Oops, something went wrong: ${e}`);
  }
})();
