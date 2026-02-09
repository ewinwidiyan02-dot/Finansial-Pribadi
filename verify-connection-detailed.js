import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('Configured URL:', supabaseUrl)
console.log('Configured Key (prefix):', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'MISSING')

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Attempting to fetch data from "wallets"...')
    try {
        const { data, error } = await supabase.from('wallets').select('*').limit(1)
        if (error) {
            console.error('Supabase Error:', error)
        } else {
            console.log('Success! Connection verified.')
            console.log('Data received:', data)
        }
    } catch (e) {
        console.error('Exception during request:', e)
    }
}

test()
