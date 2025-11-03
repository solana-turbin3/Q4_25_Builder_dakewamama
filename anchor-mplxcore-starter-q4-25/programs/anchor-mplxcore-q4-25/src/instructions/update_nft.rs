use anchor_lang::prelude::*;
use mpl_core::{
    instructions::UpdateV1CpiBuilder,
    ID as CORE_PROGRAM_ID,
};

use crate::state::CollectionAuthority;

#[derive(Accounts)]
pub struct UpdateNft<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    /// CHECK: Validated by MPL Core
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,
    
    /// CHECK: Validated by MPL Core
    pub collection: UncheckedAccount<'info>,
    
    #[account(
        seeds = [b"collection_authority", collection.key().as_ref()],
        bump = collection_authority.bump,
    )]
    pub collection_authority: Account<'info, CollectionAuthority>,
    
    /// CHECK: This is the MPL Core program
    #[account(address = CORE_PROGRAM_ID)]
    pub core_program: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> UpdateNft<'info> {
    pub fn update_nft(&mut self, new_name: String) -> Result<()> {
        let collection_key = self.collection.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"collection_authority",
            collection_key.as_ref(),
            &[self.collection_authority.bump],
        ]];

        UpdateV1CpiBuilder::new(&self.core_program.to_account_info())
            .asset(&self.asset.to_account_info())
            .collection(Some(&self.collection.to_account_info()))
            .payer(&self.owner.to_account_info())
            .authority(Some(&self.collection_authority.to_account_info()))
            .system_program(&self.system_program.to_account_info())
            .new_name(new_name)
            .invoke_signed(signer_seeds)?;

        Ok(())
    }
}
