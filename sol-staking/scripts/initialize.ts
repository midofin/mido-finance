import * as anchor from "@project-serum/anchor";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { SolStaking } from "../target/types/sol_staking";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Keypair } from "@solana/web3.js";
import { BN } from "bn.js";
import * as fs from 'fs';

async function main() {
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);

  const programId = new PublicKey("3rYML96UQicjeEFshfJEFugB7p28t7fmYWRLHSu84mQg");
  const idl = JSON.parse(fs.readFileSync('./target/idl/sol_staking.json', 'utf8'));
  const program = new anchor.Program(idl, programId, provider);

  console.log("Program loaded:", program.programId.toBase58());

  // Generate keypairs for staking pool and mint
  const stakingPoolKeypair = web3.Keypair.generate();
  const mint = web3.Keypair.generate();

  // Derive the treasury PDA
  const [treasury, treasuryBump] = await PublicKey.findProgramAddress(
    [Buffer.from("treasury"), stakingPoolKeypair.publicKey.toBuffer()],
    programId
  );

  // Derive the mint authority PDA
  const [mintAuthority, mintAuthorityBump] = await PublicKey.findProgramAddress(
    [Buffer.from("mint_authority"), stakingPoolKeypair.publicKey.toBuffer()],
    programId
  );

  // Define input parameters
  const mintBump = mintAuthorityBump;
  const withdrawalLimit = new BN(9000000000); // 9 SOL (1 SOL = 1,000,000,000 lamports)
  const timeLock = new BN(18000); // 5 hours in seconds

  // Log the derived addresses
  console.log("Staking Pool Address:", stakingPoolKeypair.publicKey.toBase58());
  console.log("Treasury PDA:", treasury.toBase58());
  console.log("Mint Authority PDA:", mintAuthority.toBase58());
  console.log("Mint Address:", mint.publicKey.toBase58());
  console.log("Admin (Wallet) Address:", provider.wallet.publicKey.toBase58());

  try {
    const tx = await program.methods
      .initialize(mintBump, withdrawalLimit, timeLock)
      .accounts({
        stakingPool: stakingPoolKeypair.publicKey,
        treasury: treasury,
        admin: provider.wallet.publicKey,
        mint: mint.publicKey,
        mintAuthority: mintAuthority,
        systemProgram: SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([stakingPoolKeypair, mint])
      .rpc();

    console.log("Initialization Transaction Signature:", tx);

    // Optional: Confirm the transaction
    const confirmation = await provider.connection.confirmTransaction(tx);
    console.log("Transaction Confirmation:", confirmation);
  } catch (error) {
    console.error("Error initializing program:", error);
    if (error instanceof anchor.AnchorError) {
      console.error("Error code:", error.error.errorCode.code);
      console.error("Error message:", error.error.errorMessage);
    }
  }
}

main()
  .then(() => {
    console.log("Program initialized successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error initializing program:", error);
    process.exit(1);
  });