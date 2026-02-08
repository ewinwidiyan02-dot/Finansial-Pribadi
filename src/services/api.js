import { supabase } from './supabaseClient';

export const api = {
    // Wallets
    getWallets: async () => {
        const { data, error } = await supabase.from('wallets').select('*').order('id');
        if (error) throw error;
        return data;
    },

    createWallet: async (wallet) => {
        const { data, error } = await supabase.from('wallets').insert(wallet).select();
        if (error) throw error;
        return data[0];
    },

    // Categories
    getCategories: async () => {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (error) throw error;
        return data;
    },

    // Transactions
    getTransactions: async () => {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
        *,
        category:categories(name, icon, type),
        wallet:wallets(name, icon)
      `)
            .order('date', { ascending: false });
        if (error) throw error;
        return data;
    },

    createTransaction: async (transaction) => {
        const { data, error } = await supabase.from('transactions').insert(transaction).select();
        if (error) throw error;

        // Update Wallet Balance
        if (transaction.wallet_id) {
            const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', transaction.wallet_id).single();
            if (wallet) {
                const newBalance = transaction.type === 'income'
                    ? wallet.balance + transaction.amount
                    : wallet.balance - transaction.amount;

                await supabase.from('wallets').update({ balance: newBalance }).eq('id', transaction.wallet_id);
            }
        }

        return data[0];
    },

    // Dashboard Aggregations
    getDashboardData: async () => {
        // 1. Get Wallets for Total Balance & Investment
        const { data: wallets } = await supabase.from('wallets').select('balance, type');
        const totalBalance = wallets?.reduce((acc, curr) => acc + curr.balance, 0) || 0;
        const investmentBalance = wallets?.filter(w => w.type === 'investment').reduce((acc, curr) => acc + curr.balance, 0) || 0;

        // 2. Get This Month's Transactions for Income/Expense
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { data: currentMonthTrans } = await supabase
            .from('transactions')
            .select('amount, type, date')
            .gte('date', startOfMonth);

        const income = currentMonthTrans
            ?.filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0) || 0;
        const expense = currentMonthTrans
            ?.filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0) || 0;

        // 3. Get Budget Limits
        const { data: categories } = await supabase.from('categories').select('budget_limit, type');
        const totalBudgetLimit = categories?.filter(c => c.type === 'expense').reduce((acc, curr) => acc + (curr.budget_limit || 0), 0) || 0;

        // 4. Get Recent Transactions
        const { data: recent } = await supabase
            .from('transactions')
            .select(`*, category:categories(id, name, type), wallet:wallets(id, name)`)
            .order('date', { ascending: false })
            .limit(5);

        return {
            summary: {
                balance: totalBalance,
                income,
                expense,
                investment: investmentBalance,
                budgetLimit: totalBudgetLimit
            },
            transactions: recent || []
        };
    },

    // Budget Data
    getBudgetData: async () => {
        const { data: categories } = await supabase.from('categories').select('*');

        // Calculate spent per category for this month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const { data: transactions } = await supabase
            .from('transactions')
            .select('amount, category_id')
            .eq('type', 'expense')
            .gte('date', startOfMonth);

        const spentByCategory = {};
        transactions?.forEach(t => {
            spentByCategory[t.category_id] = (spentByCategory[t.category_id] || 0) + t.amount;
        });

        return categories.map(cat => ({
            ...cat,
            spent: spentByCategory[cat.id] || 0
        }));
    }
};
