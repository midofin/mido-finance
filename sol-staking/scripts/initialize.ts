import * as anchor from "@project-serum/anchor";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Keypair } from "@solana/web3.js";
import { BN } from "bn.js";
import * as fs from 'fs';

async function main() {
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);
  console.log("Connected to:", provider.connection.rpcEndpoint);
  console.log("Wallet address:", provider.wallet.publicKey.toBase58());

  // Load the program
  const programId = new PublicKey("EhE7Rwiw94Lq6GPdG9iafbNV8mUzds5XcfZfJ1GG7184");
  const idl = JSON.parse(fs.readFileSync('./target/idl/sol_staking.json', 'utf8'));
  const program = new anchor.Program(idl, programId, provider);

  console.log("Program loaded:", program.programId.toBase58());

  // Check wallet balance
  const balance = await provider.connection.getBalance(provider.wallet.publicKey);
  console.log("Wallet balance:", balance / web3.LAMPORTS_PER_SOL, "SOL");
  if (balance < 0.05 * web3.LAMPORTS_PER_SOL) {
    throw new Error("Insufficient wallet balance for initialization (need ~0.05 SOL)");
  }

  // Generate keypairs for staking pool and mint
  const stakingPoolKeypair = web3.Keypair.generate();
  const mint = web3.Keypair.generate();

  // Derive the treasury PDA
  const [treasury, treasuryBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), stakingPoolKeypair.publicKey.toBuffer()],
    programId
  );

  // Derive the mint authority PDA
  const [mintAuthority, mintAuthorityBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint_authority"), stakingPoolKeypair.publicKey.toBuffer()],
    programId
  );

  // Define input parameters
  const mintBump = mintAuthorityBump;
  const withdrawalLimit = new BN(9000000000); // 9 SOL
  const timeLock = new BN(18000); // 5 hours in seconds

  // Log the derived addresses
  console.log("Staking Pool Address:", stakingPoolKeypair.publicKey.toBase58());
  console.log("Treasury PDA:", treasury.toBase58());
  console.log("Mint Authority PDA:", mintAuthority.toBase58());
  console.log("Mint Address:", mint.publicKey.toBase58());
  console.log("Admin (Wallet) Address:", provider.wallet.publicKey.toBase58());
  console.log("System Program:", SystemProgram.programId.toBase58());

  try {
    // Initialize the staking pool
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
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([stakingPoolKeypair, mint])
      .rpc({ commitment: "confirmed" });

    console.log("Initialization Transaction Signature:", tx);

    // Verify the transaction
    const txDetails = await provider.connection.getTransaction(tx, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (!txDetails) {
      throw new Error("Failed to confirm initialization transaction");
    }
    console.log("Initialization transaction confirmed");

    // Create metadata for the token
    const metadataUrl = "https://raw.githubusercontent.com/chinmoykalita/mido-finance/refs/heads/main/sol-staking/metadata/metadata.json";
    
    // Verify metadata URL
    console.log("Verifying metadata URL:", metadataUrl);
    const response = await fetch(metadataUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata JSON: ${response.statusText}`);
    }
    const metadataJson = await response.json();
    console.log("Metadata JSON:", metadataJson);

    // Get the metadata address
    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const metadataTx = await program.methods
      .createMetadata(
        "mSOL",
        "MSOL",
        metadataUrl
      )
      .accounts({
        stakingPool: stakingPoolKeypair.publicKey,
        metadata: metadata,
        mint: mint.publicKey,
        mintAuthority: mintAuthority,
        payer: provider.wallet.publicKey,
        updateAuthority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenMetadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
      })
      .signers([]) // No keypair signers needed
      .preInstructions([
        web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 600_000 }), // Increased compute budget
      ])
      .rpc({ commitment: "confirmed" });

    console.log("Metadata Creation Transaction Signature:", metadataTx);

    // Verify the metadata transaction
    const metadataTxDetails = await provider.connection.getTransaction(metadataTx, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (!metadataTxDetails) {
      throw new Error("Failed to confirm metadata creation transaction");
    }
    console.log("Metadata creation transaction confirmed");

  } catch (error) {
    console.error("Error:", error);
    if (error instanceof anchor.AnchorError) {
      console.error("Error code:", error.error.errorCode.code);
      console.error("Error message:", error.error.errorMessage);
    }
    throw error;
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