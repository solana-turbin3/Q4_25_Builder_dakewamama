import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../turbin3-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("GdHGQ9iDfhFXaW845FMFe5xtiTb1d9DHFfDjGsPLZ8vb");

// Recipient address
const to = new PublicKey("G7MTCM2S1W6ufPhYLjodUyRZLBFbPz91CXd5C63aWoqV");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it

        let our_ata = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey,
        );

        // Get the token account of the toWallet address, and if it does not exist, create it

        let to_ata = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to,
        );

        // Transfer the new token to the "toTokenAccount" we just created
        let tx = await transfer(
            connection,
            keypair,
            our_ata.address,
            to_ata.address,
            keypair.publicKey,
            5 * 1e6, // this is in the decimals we defined!!! (6). this means this transfers 5 tokens
        )
        console.log(tx);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();