import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { SolStaking } from "../target/types/sol_staking";
import { expect } from "chai";

describe("sol-staking", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolStaking as Program<SolStaking>;

  it("Initialize staking pool", async () => {
    const admin = provider.wallet.publicKey;
    const stakingPoolKey = anchor.web3.Keypair.generate();

    const [treasuryPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("treasury"), stakingPoolKey.publicKey.toBuffer()],
      program.programId
    );
    const [mintAuthorityPDA, mintAuthorityBump] =
      await PublicKey.findProgramAddress(
        [Buffer.from("mint_authority"), stakingPoolKey.publicKey.toBuffer()],
        program.programId
      );

    const mintKeypair = anchor.web3.Keypair.generate();

    const withdrawalLimit = new anchor.BN(1000000000);
    const timeLock = new anchor.BN(86400);

    await program.methods
      .initialize(mintAuthorityBump, withdrawalLimit, timeLock)
      .accounts({
        stakingPool: stakingPoolKey.publicKey,
        treasury: treasuryPDA,
        admin: admin,
        mint: mintKeypair.publicKey,
        mintAuthority: mintAuthorityPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([stakingPoolKey, mintKeypair])
      .rpc();

    const stakingPool = await program.account.stakingPool.fetch(
      stakingPoolKey.publicKey,
      "confirmed"
    );

    expect(stakingPool.admin.equals(admin)).is.true;
    expect(stakingPool.treasury.equals(treasuryPDA)).is.true;
    expect(stakingPool.withdrawalLimit.eq(withdrawalLimit)).is.true;
    expect(stakingPool.timeLock.eq(timeLock)).is.true;
  });
});
