import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env file.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    console.log('Testing connection to Supabase...')
    try {
        const { data, error } = await supabase.from('wallets').select('count', { count: 'exact', head: true })
        if (error) {
            console.error('Connection failed:', error.message)
        } else {
            console.log('Connection successful! Wallets table accessible.')
        }
    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

testConnection()
