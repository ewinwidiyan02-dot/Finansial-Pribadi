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

    createCategory: async (category) => {
        console.log("Saving category...", category);
        const { data, error } = await supabase.from('categories').insert(category).select();
        if (error) {
            console.error("Supabase Error:", error);
            throw error;
        }
        return data[0];
    },

    updateCategory: async (id, updates) => {
        const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    deleteCategory: async (id) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        return true;
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

        // Total Saldo (Liquid Cash): Exclude investment
        const totalBalance = wallets?.filter(w => w.type !== 'investment').reduce((acc, curr) => acc + curr.balance, 0) || 0;

        // Total Investasi: Only investment
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

        // 5. Generate Chart Data (Daily Expense Trend)
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const chartData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = new Date(new Date().getFullYear(), new Date().getMonth(), day).toISOString().split('T')[0]; // YYYY-MM-DD (local logic approx)
            // Note: simple string matching might have timezone issues if not careful, 
            // but for a local app relying on 'date' column as string YYYY-MM-DD it's fine.
            // Let's use the date string directly from DB which is YYYY-MM-DD
            return { name: day.toString(), amount: 0, fullDate: dateStr };
        });

        currentMonthTrans?.filter(t => t.type === 'expense').forEach(t => {
            const day = parseInt(t.date.split('-')[2], 10); // 2023-01-05 -> 5
            if (day >= 1 && day <= daysInMonth) {
                chartData[day - 1].amount += t.amount;
            }
        });

        return {
            summary: {
                balance: totalBalance,
                income,
                expense,
                investment: investmentBalance,
                budgetLimit: totalBudgetLimit
            },
            transactions: recent || [],
            chart: chartData
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
    },

    // Budget Helper
    getCategoryBudgetStatus: async (categoryId) => {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

        // Get Category Limit
        const { data: category } = await supabase.from('categories').select('budget_limit').eq('id', categoryId).single();
        if (!category) return null;

        // Get Spent this month
        const { data: transactions } = await supabase
            .from('transactions')
            .select('amount')
            .eq('category_id', categoryId)
            .eq('type', 'expense')
            .gte('date', startOfMonth);

        const spent = transactions?.reduce((acc, t) => acc + t.amount, 0) || 0;
        const remaining = (category.budget_limit || 0) - spent;

        return {
            limit: category.budget_limit || 0,
            spent,
            remaining
        };
    },

    transferBudgetLimit: async (sourceId, targetId, amount) => {
        // 1. Get Source Category
        const { data: sourceCat } = await supabase.from('categories').select('budget_limit').eq('id', sourceId).single();
        if (!sourceCat) throw new Error('Source category not found');

        // 2. Get Target Category
        const { data: targetCat } = await supabase.from('categories').select('budget_limit').eq('id', targetId).single();
        if (!targetCat) throw new Error('Target category not found');

        // 3. Update Source
        const newSourceLimit = Math.max(0, (sourceCat.budget_limit || 0) - amount);
        await supabase.from('categories').update({ budget_limit: newSourceLimit }).eq('id', sourceId);

        // 4. Update Target
        const newTargetLimit = (targetCat.budget_limit || 0) + amount;
        await supabase.from('categories').update({ budget_limit: newTargetLimit }).eq('id', targetId);
    }
};
