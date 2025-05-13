import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolStaking } from "../target/types/sol_staking";
import { PublicKey, SystemProgram, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo, getAccount } from "@solana/spl-token";
import assert from "assert";
import { MPL_TOKEN_METADATA_PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

describe("sol-staking", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolStaking as Program<SolStaking>;
  
  // Test accounts
  const admin = Keypair.generate();
  const user = Keypair.generate();
  const newAdmin = Keypair.generate(); // For testing admin change
  const stakingPoolKp = Keypair.generate();
  const mintKp = Keypair.generate();
  
  // PDAs
  let treasuryPda: PublicKey;
  let mintAuthorityPda: PublicKey;
  let treasuryBump: number;
  let mintAuthorityBump: number;

  // Token accounts
  let userMsolAccount: PublicKey;

  // Constants
  const stakeAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);
  const unstakeAmount = new anchor.BN(0.5 * LAMPORTS_PER_SOL);
  const withdrawAmount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
  const withdrawalLimit = new anchor.BN(100 * LAMPORTS_PER_SOL);
  const timeLock = new anchor.BN(24 * 60 * 60); // 24 hours

  before(async () => {
    // Airdrop SOL to admin and user
    const adminAirdrop = await provider.connection.requestAirdrop(
      admin.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(adminAirdrop);

    const userAirdrop = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(userAirdrop);
    
    const newAdminAirdrop = await provider.connection.requestAirdrop(
      newAdmin.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(newAdminAirdrop);

    // Find PDAs
    [treasuryPda, treasuryBump] = await PublicKey.findProgramAddress(
      [Buffer.from("treasury"), stakingPoolKp.publicKey.toBuffer()],
      program.programId
    );

    [mintAuthorityPda, mintAuthorityBump] = await PublicKey.findProgramAddress(
      [Buffer.from("mint_authority"), stakingPoolKp.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes the staking pool", async () => {
    await program.methods
      .initialize(mintAuthorityBump, withdrawalLimit, timeLock)
      .accounts({
        stakingPool: stakingPoolKp.publicKey,
        treasury: treasuryPda,
        admin: admin.publicKey,
        mint: mintKp.publicKey,
        mintAuthority: mintAuthorityPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([admin, stakingPoolKp, mintKp])
      .rpc();

    // Verify staking pool account
    const stakingPool = await program.account.stakingPool.fetch(stakingPoolKp.publicKey);
    assert.ok(stakingPool.admin.equals(admin.publicKey));
    assert.ok(stakingPool.treasury.equals(treasuryPda));
    assert.ok(stakingPool.withdrawalLimit.eq(withdrawalLimit));
    assert.ok(stakingPool.timeLock.eq(timeLock));
    assert.equal(stakingPool.mintBump, mintAuthorityBump);
    assert.equal(stakingPool.lastWithdrawal.toNumber(), 0);
  });

  it("Creates metadata for mSOL token", async () => {
    // Find the metadata PDA
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        Buffer.from(TOKEN_METADATA_PROGRAM_ID),
        mintKp.publicKey.toBuffer(),
      ],
      new PublicKey(TOKEN_METADATA_PROGRAM_ID)
    );

    // Use the program's create_metadata instruction
    await program.methods
      .createMetadata(
        "mSOL",
        "mSOL",
        "https://raw.githubusercontent.com/chinmoykalita/mido-finance/refs/heads/main/sol-staking/metadata/metadata.json"
      )
      .accounts({
        metadata: metadataAddress,
        mint: mintKp.publicKey,
        mintAuthority: mintAuthorityPda,
        payer: admin.publicKey,
        updateAuthority: admin.publicKey,
        systemProgram: SystemProgram.programId,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([admin])
      .rpc();

    // Can verify metadata was created by fetching the account
    const metadataAccount = await provider.connection.getAccountInfo(metadataAddress);
    assert.ok(metadataAccount !== null, "Metadata account wasn't created");
  });

  it("Allows user to stake SOL", async () => {
    // Create user's mSOL token account
    userMsolAccount = await createAccount(
      provider.connection,
      user,
      mintKp.publicKey,
      user.publicKey
    );

    // Get initial balances
    const initialUserSolBalance = await provider.connection.getBalance(user.publicKey);
    const initialTreasurySolBalance = await provider.connection.getBalance(treasuryPda);

    await program.methods
      .stake(stakeAmount)
      .accounts({
        stakingPool: stakingPoolKp.publicKey,
        user: user.publicKey,
        userMsolAccount: userMsolAccount,
        treasury: treasuryPda,
        mint: mintKp.publicKey,
        mintAuthority: mintAuthorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Verify user's mSOL balance
    const userMsolAccountInfo = await getAccount(provider.connection, userMsolAccount);
    assert.equal(userMsolAccountInfo.amount.toString(), stakeAmount.toString());

    // Verify SOL balances
    const finalUserSolBalance = await provider.connection.getBalance(user.publicKey);
    const finalTreasurySolBalance = await provider.connection.getBalance(treasuryPda);
    
    // Account for transaction fees approximately
    assert.ok(initialUserSolBalance > finalUserSolBalance + stakeAmount.toNumber() - 5000);
    assert.equal(finalTreasurySolBalance - initialTreasurySolBalance, stakeAmount.toNumber());
  });

  it("Allows user to unstake SOL", async () => {
    // Get initial balances
    const initialUserSolBalance = await provider.connection.getBalance(user.publicKey);
    const initialTreasurySolBalance = await provider.connection.getBalance(treasuryPda);
    const initialUserMsolBalance = (await getAccount(provider.connection, userMsolAccount)).amount;

    await program.methods
      .unstake(unstakeAmount)
      .accounts({
        stakingPool: stakingPoolKp.publicKey,
        user: user.publicKey,
        userMsolAccount: userMsolAccount,
        treasury: treasuryPda,
        mint: mintKp.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Verify balances
    const finalUserSolBalance = await provider.connection.getBalance(user.publicKey);
    const finalTreasurySolBalance = await provider.connection.getBalance(treasuryPda);
    const finalUserMsolBalance = (await getAccount(provider.connection, userMsolAccount)).amount;

    // SOL balances should reflect the unstaking
    assert.ok(finalUserSolBalance > initialUserSolBalance + unstakeAmount.toNumber() - 5000); // Account for tx fees
    assert.equal(initialTreasurySolBalance - finalTreasurySolBalance, unstakeAmount.toNumber());
    
    // mSOL balance should be reduced
    assert.equal(
      initialUserMsolBalance - finalUserMsolBalance, 
      BigInt(unstakeAmount.toString())
    );
  });

  it("Allows admin to withdraw funds", async () => {
    // Get initial balances
    const initialAdminBalance = await provider.connection.getBalance(admin.publicKey);
    const initialTreasuryBalance = await provider.connection.getBalance(treasuryPda);

    await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        stakingPool: stakingPoolKp.publicKey,
        admin: admin.publicKey,
        treasury: treasuryPda,
      })
      .signers([admin])
      .rpc();

    // Verify balances
    const finalAdminBalance = await provider.connection.getBalance(admin.publicKey);
    const finalTreasuryBalance = await provider.connection.getBalance(treasuryPda);

    // Admin should have received the withdrawn amount minus tx fees
    assert.ok(finalAdminBalance > initialAdminBalance + withdrawAmount.toNumber() - 5000);
    
    // Treasury should have lost the withdrawn amount
    assert.equal(initialTreasuryBalance - finalTreasuryBalance, withdrawAmount.toNumber());
    
    // Verify last_withdrawal was updated
    const stakingPool = await program.account.stakingPool.fetch(stakingPoolKp.publicKey);
    assert.ok(stakingPool.lastWithdrawal.toNumber() > 0);
  });

  it("Changes admin", async () => {
    await program.methods
      .changeAdmin(newAdmin.publicKey)
      .accounts({
        stakingPool: stakingPoolKp.publicKey,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();

    // Verify admin changed
    const stakingPool = await program.account.stakingPool.fetch(stakingPoolKp.publicKey);
    assert.ok(stakingPool.admin.equals(newAdmin.publicKey));
  });

  it("Only allows new admin to perform admin functions", async () => {
    // Try to withdraw with old admin (should fail)
    try {
      await program.methods
        .withdraw(withdrawAmount)
        .accounts({
          stakingPool: stakingPoolKp.publicKey,
          admin: admin.publicKey,
          treasury: treasuryPda,
        })
        .signers([admin])
        .rpc();
      assert.fail("Expected transaction to fail");
    } catch (err) {
      assert.ok(err.toString().includes("Unauthorized"));
    }

    // Try with new admin (should succeed)
    await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        stakingPool: stakingPoolKp.publicKey,
        admin: newAdmin.publicKey,
        treasury: treasuryPda,
      })
      .signers([newAdmin])
      .rpc();
  });

  it("Sets upgrade authority", async () => {
    await program.methods
      .setUpgradeAuthority(admin.publicKey)
      .accounts({
        stakingPool: stakingPoolKp.publicKey,
        currentAuthority: newAdmin.publicKey,
      })
      .signers([newAdmin])
      .rpc();

    // Verify upgrade authority changed
    const stakingPool = await program.account.stakingPool.fetch(stakingPoolKp.publicKey);
    assert.ok(stakingPool.upgradeAuthority.equals(admin.publicKey));
  });

  it("Prevents unauthorized users from staking more than they have", async () => {
    const excessiveAmount = new anchor.BN(1000 * LAMPORTS_PER_SOL);
    
    try {
      await program.methods
        .stake(excessiveAmount)
        .accounts({
          stakingPool: stakingPoolKp.publicKey,
          user: user.publicKey,
          userMsolAccount: userMsolAccount,
          treasury: treasuryPda,
          mint: mintKp.publicKey,
          mintAuthority: mintAuthorityPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();
      assert.fail("Expected transaction to fail");
    } catch (err) {
      // This should fail with insufficient funds error
      assert.ok(err.toString().includes("insufficient lamports"));
    }
  });

  it("Prevents unstaking more than user has", async () => {
    const excessiveAmount = new anchor.BN(100 * LAMPORTS_PER_SOL);
    
    try {
      await program.methods
        .unstake(excessiveAmount)
        .accounts({
          stakingPool: stakingPoolKp.publicKey,
          user: user.publicKey,
          userMsolAccount: userMsolAccount,
          treasury: treasuryPda,
          mint: mintKp.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();
      assert.fail("Expected transaction to fail");
    } catch (err) {
      assert.ok(err.toString().includes("InsufficientMsolBalance"));
    }
  });
});