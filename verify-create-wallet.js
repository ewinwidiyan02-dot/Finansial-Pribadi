import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testCreateWallet() {
    console.log('Testing createWallet...');
    const testWallet = {
        name: 'Test Wallet ' + Date.now(),
        type: 'cash',
        balance: 1000,
        icon: 'MdAttachMoney'
    };

    try {
        const { data, error } = await supabase.from('wallets').insert(testWallet).select();
        if (error) {
            console.error('Failed to create wallet:', error);
        } else {
            console.log('Wallet created successfully:', data[0]);
            // Cleanup
            await supabase.from('wallets').delete().eq('id', data[0].id);
            console.log('Test wallet deleted.');
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

testCreateWallet();
