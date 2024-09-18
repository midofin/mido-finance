use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, MintTo, Burn};
use mpl_token_metadata::instruction as metadata_instruction;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod sol_staking {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        mint_bump: u8,
        withdrawal_limit: u64,
        time_lock: i64
    ) -> Result<()> {
        let staking_pool = &mut ctx.accounts.staking_pool;
        staking_pool.mint_bump = mint_bump;
        staking_pool.treasury = ctx.accounts.treasury.key();
        staking_pool.admin = ctx.accounts.admin.key();
        staking_pool.withdrawal_limit = withdrawal_limit;
        staking_pool.last_withdrawal = 0;
        staking_pool.time_lock = time_lock;
        
        emit!(InitializeEvent {
            admin: ctx.accounts.admin.key(),
            treasury: ctx.accounts.treasury.key(),
            mint: ctx.accounts.mint.key(),
        });
        
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        let staking_pool = &ctx.accounts.staking_pool;

        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.treasury.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.treasury.to_account_info(),
            ],
        )?;

        // Mint mSOL tokens to the user
        token::mint_to(
            ctx.accounts.into_mint_context(),
            amount,
        )?;

        emit!(StakeEvent {
            user: ctx.accounts.user.key(),
            amount,
        });

        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        // Check if treasury has enough balance
        let treasury_balance = ctx.accounts.treasury.lamports();
        if treasury_balance < amount {
            return Err(ErrorCode::InsufficientTreasuryBalance.into());
        }

        if ctx.accounts.user_msol_account.amount < amount {
            return Err(ErrorCode::InsufficientMsolBalance.into());
        }

        token::burn(
            ctx.accounts.into_burn_context(),
            amount,
        )?;

        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.user.try_borrow_mut_lamports()? += amount;

        emit!(UnstakeEvent {
            user: ctx.accounts.user.key(),
            amount,
        });

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let staking_pool = &mut ctx.accounts.staking_pool;
        let current_time = Clock::get()?.unix_timestamp;

        if ctx.accounts.admin.key() != staking_pool.admin {
            return Err(ErrorCode::Unauthorized.into());
        }

        if current_time - staking_pool.last_withdrawal < staking_pool.time_lock {
            return Err(ErrorCode::WithdrawalTooSoon.into());
        }

        if amount > staking_pool.withdrawal_limit {
            return Err(ErrorCode::WithdrawalLimitExceeded.into());
        }

        let treasury_balance = ctx.accounts.treasury.lamports();
        if treasury_balance < amount {
            return Err(ErrorCode::InsufficientTreasuryBalance.into());
        }

        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.admin.to_account_info().try_borrow_mut_lamports()? += amount;

        staking_pool.last_withdrawal = current_time;

        emit!(WithdrawEvent {
            admin: ctx.accounts.admin.key(),
            amount,
        });

        Ok(())
    }

    pub fn create_metadata(ctx: Context<CreateMetadata>, name: String, symbol: String, uri: String) -> Result<()> {
        let seeds = &[b"mint_authority", ctx.accounts.staking_pool.key().as_ref()];
        let (_, bump) = Pubkey::find_program_address(seeds, ctx.program_id);
        let signer_seeds = &[b"mint_authority", ctx.accounts.staking_pool.key().as_ref(), &[bump]];

        let accounts = metadata_instruction::CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata.key(),
            mint: ctx.accounts.mint.key(),
            mint_authority: ctx.accounts.mint_authority.key(),
            payer: ctx.accounts.payer.key(),
            update_authority: ctx.accounts.mint_authority.key(),
            system_program: ctx.accounts.system_program.key(),
            rent: ctx.accounts.rent.key(),
        };

        let instruction = metadata_instruction::create_metadata_accounts_v3(
            ctx.accounts.token_metadata_program.key(),
            accounts,
            mpl_token_metadata::state::DataV2 {
                name,
                symbol,
                uri,
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            true,
            true,
            None,
        );

        anchor_lang::solana_program::program::invoke_signed(
            &instruction,
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.mint_authority.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.mint_authority.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
            &[signer_seeds],
        )?;

        emit!(CreateMetadataEvent {
            mint: ctx.accounts.mint.key(),
            metadata: ctx.accounts.metadata.key(),
        });

        Ok(())
    }

    pub fn change_admin(ctx: Context<ChangeAdmin>, new_admin: Pubkey) -> Result<()> {
        let staking_pool = &mut ctx.accounts.staking_pool;

        if new_admin == Pubkey::default() {
            return Err(ErrorCode::InvalidAdminAddress.into());
        }

        staking_pool.admin = new_admin;

        emit!(ChangeAdminEvent {
            old_admin: ctx.accounts.admin.key(),
            new_admin,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin, space = 8 + 32 + 32 + 8 + 8 + 8 + 8)]
    pub staking_pool: Account<'info, StakingPool>,
    #[account(
        seeds = [b"treasury", staking_pool.key().as_ref()],
        bump,
    )]
    /// CHECK: This is safe because it's a PDA owned by the program
    pub treasury: AccountInfo<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        mint::decimals = 9,
        mint::authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,
    /// CHECK: This is safe because it's a PDA that will be the mint authority
    #[account(
        seeds = [b"mint_authority", staking_pool.key().as_ref()],
        bump,
    )]
    pub mint_authority: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_msol_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"treasury", staking_pool.key().as_ref()],
        bump,
    )]
    /// CHECK: This is safe because it's a PDA owned by the program
    pub treasury: AccountInfo<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: This is safe because it's a PDA that is the mint authority
    #[account(
        seeds = [b"mint_authority", staking_pool.key().as_ref()],
        bump,
    )]
    pub mint_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_msol_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"treasury", staking_pool.key().as_ref()],
        bump,
    )]
    /// CHECK: This is safe because it's a PDA owned by the program
    pub treasury: AccountInfo<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: This is safe because it's a PDA that is the mint authority
    #[account(
        seeds = [b"mint_authority", staking_pool.key().as_ref()],
        bump,
    )]
    pub mint_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [b"treasury", staking_pool.key().as_ref()],
        bump,
    )]
    /// CHECK: This is safe because it's a PDA owned by the program
    pub treasury: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CreateMetadata<'info> {
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: This is safe because it's a PDA that is the mint authority
    #[account(
        seeds = [b"mint_authority", staking_pool.key().as_ref()],
        bump,
    )]
    pub mint_authority: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This account is created by the Metaplex program
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    pub token_metadata_program: Program<'info, MplTokenMetadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ChangeAdmin<'info> {
    #[account(mut, has_one = admin @ ErrorCode::Unauthorized)]
    pub staking_pool: Account<'info, StakingPool>,
    pub admin: Signer<'info>,
}

#[account]
pub struct StakingPool {
    pub mint_bump: u8,
    pub treasury: Pubkey,
    pub admin: Pubkey,
    pub withdrawal_limit: u64,
    pub last_withdrawal: i64,
    pub time_lock: i64,
}

impl<'info> Stake<'info> {
    fn into_mint_context(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        CpiContext::new(self.token_program.to_account_info(), MintTo {
            mint: self.mint.to_account_info(),
            to: self.user_msol_account.to_account_info(),
            authority: self.mint_authority.to_account_info(),
        })
    }
}

impl<'info> Unstake<'info> {
    fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        CpiContext::new(self.token_program.to_account_info(), Burn {
            mint: self.mint.to_account_info(),
            from: self.user_msol_account.to_account_info(),
            authority: self.user.to_account_info(),
        })
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("Insufficient balance in the treasury.")]
    InsufficientTreasuryBalance,
    #[msg("Insufficient mSOL balance for unstaking.")]
    InsufficientMsolBalance,
    #[msg("Withdrawal limit exceeded.")]
    WithdrawalLimitExceeded,
    #[msg("Withdrawal too soon after the last withdrawal.")]
    WithdrawalTooSoon,
    #[msg("Invalid admin address. The admin cannot be set to the zero address.")]
    InvalidAdminAddress,
}

#[event]
pub struct InitializeEvent {
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub mint: Pubkey,
}

#[event]
pub struct StakeEvent {
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct UnstakeEvent {
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct WithdrawEvent {
    pub admin: Pubkey,
    pub amount: u64,
}

#[event]
pub struct CreateMetadataEvent {
    pub mint: Pubkey,
    pub metadata: Pubkey,
}

#[event]
pub struct ChangeAdminEvent {
    pub old_admin: Pubkey,
    pub new_admin: Pubkey,
}