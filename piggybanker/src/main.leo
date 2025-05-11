import credits.aleo;
// The 'piggybanker10' program.
program piggybanker10.aleo {
    const CREDITS_TOKEN_ID: field = 3443843282313283355522573239085696902919850365217539366784739393210722344986field;

    record Vault {
        owner: address,
        amount: u128,
        token_id: field,
        start_time: u32,
        end_time: u32
    }
  mapping account: address  => u64 ;

    async transition rcreatevault(input_record: credits.aleo/credits, height: u32, hours: u32 ,amount: u64) -> ( credits.aleo/credits,  Vault, Future) {
        
            let transfer_output: (credits.aleo/credits, Future) = credits.aleo/transfer_private_to_public(input_record, self.address, amount);
            let duration: u32 =hours * 144u32;
            let signer: address = self.signer;
            let create: Vault = Vault {
                owner: signer,
                amount: amount as u128,
                token_id: CREDITS_TOKEN_ID,
                start_time: height,
                end_time: height + duration 
        };
        return ( transfer_output.0, create, finalize_rcreatevault(transfer_output.1, height));
    }
    async function finalize_rcreatevault( transfer_output: Future,  height: u32) {
        // Check innput against current block height
        transfer_output.await();
        assert_eq(true, block.height-height < 144u32);
        return; //return the vault.
    }

    async transition createvault( height: u32, hours: u32 ,amount: u64) -> (  Vault, Future) {
        
            let transfer_output: Future = credits.aleo/transfer_public_as_signer(self.address, amount);
            let duration: u32 =hours * 144u32;
            let signer: address = self.signer;
            let create: Vault = Vault {
                owner: signer,
                amount: amount as u128,
                token_id: CREDITS_TOKEN_ID,
                start_time: height,
                end_time: height + duration 
        };
        return ( create, finalize_createvault(transfer_output, height));
    }
    async function finalize_createvault( transfer_output: Future,  height: u32) {
        // Check innput against current block height
        transfer_output.await();
        assert_eq(true, block.height-height < 144u32);
        return; //return the vault.
    }
       async transition withdraw(
        input_vault: Vault,
    public owner: address,
    public wamount: u128
  ) -> ( Vault, credits.aleo/credits, Future) {
    let vaultbalance: u128 = input_vault.amount;
    assert_eq(true, vaultbalance > 0u128);
    assert_eq(true, wamount <= vaultbalance);
    let endtime: u32 = input_vault.end_time;
    let expired: Vault = Vault {
            owner: input_vault.owner,
            amount: input_vault.amount - wamount,
            token_id: input_vault.token_id,
            start_time: input_vault.start_time,
            end_time: input_vault.end_time
        };
        let amount: u64 = wamount as u64;
    let cfuture:(credits.aleo/credits, Future) = credits.aleo/transfer_public_to_private(input_vault.owner, amount);
    return (expired, cfuture.0,  finalize_withdraw(cfuture.1, endtime));
  }
  async function finalize_withdraw( cfuture: Future, endtime:u32) {
    cfuture.await();
    assert_eq(true, block.height > endtime);
    
  }
}
