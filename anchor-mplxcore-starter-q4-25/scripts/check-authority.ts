import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111");
const programId = new PublicKey("CzPkGKrcPBnPrXNMPZ72JC3qhxWnhgTsBAoxwHYHyq2j");

const [programDataAddress] = PublicKey.findProgramAddressSync(
  [programId.toBuffer()],
  BPF_LOADER_UPGRADEABLE_PROGRAM_ID
);

(async () => {
  const programData = await provider.connection.getAccountInfo(programDataAddress);
  
  if (programData) {
    // Upgrade authority is at bytes 13-45
    const upgradeAuthority = new PublicKey(programData.data.slice(13, 45));
    console.log("Program ID:", programId.toString());
    console.log("Program Data Address:", programDataAddress.toString());
    console.log("Upgrade Authority:", upgradeAuthority.toString());
    console.log("Test Payer:", provider.wallet.publicKey.toString());
    console.log("Match:", upgradeAuthority.equals(provider.wallet.publicKey));
  }
})();