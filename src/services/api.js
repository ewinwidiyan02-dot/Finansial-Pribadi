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
    getTransactions: async (month, year) => {
        let query = supabase
            .from('transactions')
            .select(`
        *,
        category:categories(name, icon, type),
        wallet:wallets(name, icon)
      `)
            .order('date', { ascending: false });

        if (month !== undefined && year !== undefined) {
            const startDate = new Date(year, month, 1).toLocaleDateString('en-CA');
            const endDate = new Date(year, month + 1, 0).toLocaleDateString('en-CA');
            query = query.gte('date', startDate).lte('date', endDate);
        }

        const { data, error } = await query;
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
    getDashboardData: async (month, year) => {
        // 1. Get Wallets for Total Balance & Investment
        const { data: wallets } = await supabase.from('wallets').select('balance, type');

        // Total Saldo (Liquid Cash): Exclude investment
        const totalBalance = wallets?.filter(w => w.type !== 'investment').reduce((acc, curr) => acc + curr.balance, 0) || 0;

        // Total Investasi: Only investment
        const investmentBalance = wallets?.filter(w => w.type === 'investment').reduce((acc, curr) => acc + curr.balance, 0) || 0;

        // 2. Get Transactions for Selected Month
        // Default to current month if not provided
        const date = new Date();
        const targetMonth = month !== undefined ? month : date.getMonth();
        const targetYear = year !== undefined ? year : date.getFullYear();

        const startDate = new Date(targetYear, targetMonth, 1).toLocaleDateString('en-CA');
        const endDate = new Date(targetYear, targetMonth + 1, 0).toLocaleDateString('en-CA');

        const { data: currentMonthTrans } = await supabase
            .from('transactions')
            .select('amount, type, date, category_id')
            .gte('date', startDate)
            .lte('date', endDate);

        const income = currentMonthTrans
            ?.filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0) || 0;
        const expense = currentMonthTrans
            ?.filter(t => t.type === 'expense' && t.wallet_id !== null) // Exclude budget transfers (no wallet) from real actual spending
            .reduce((acc, t) => acc + t.amount, 0) || 0;

        const budgetUsed = currentMonthTrans
            ?.filter(t => t.type === 'expense' && t.category_id !== null)
            .reduce((acc, t) => acc + t.amount, 0) || 0;

        // 3. Get Budget Limits
        const { data: categories } = await supabase.from('categories').select('budget_limit, type');
        const totalBudgetLimit = categories?.filter(c => c.type === 'expense').reduce((acc, curr) => acc + (curr.budget_limit || 0), 0) || 0;

        // 4. Get Recent Transactions (Filtered by month if needed, but usually recent is just recent regardless of month filter? 
        // User asked: "mulai dari transaksi, pagu, dan dashboard." implying list should also filter.)
        const { data: recent } = await supabase
            .from('transactions')
            .select(`*, category:categories(id, name, type), wallet:wallets(id, name)`)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false })
            .limit(5);

        // 5. Generate Chart Data (Daily Expense Trend)
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const chartData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = new Date(targetYear, targetMonth, day).toISOString().split('T')[0];
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
                budgetLimit: totalBudgetLimit,
                budgetUsed
            },
            transactions: recent || [],
            chart: chartData
        };
    },

    // Budget Data
    getBudgetData: async (month, year) => {
        const { data: categories } = await supabase.from('categories').select('*');

        // Calculate spent per category for selected month
        const date = new Date();
        const targetMonth = month !== undefined ? month : date.getMonth();
        const targetYear = year !== undefined ? year : date.getFullYear();

        const startDate = new Date(targetYear, targetMonth, 1).toLocaleDateString('en-CA');
        const endDate = new Date(targetYear, targetMonth + 1, 0).toLocaleDateString('en-CA');

        const { data: transactions } = await supabase
            .from('transactions')
            .select('amount, category_id')
            .eq('type', 'expense')
            .gte('date', startDate)
            .lte('date', endDate);

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
    // Budget Helper
    getCategoryBudgetStatus: async (categoryId) => {
        const date = new Date();
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-CA'); // YYYY-MM-DD Local

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

        // 3. Update Source Limit
        // REMOVED: Do not reduce source limit number. The 'expense' transaction below will act as the "usage" of that limit.
        // If we reduce limit AND add expense, we double hit the source category.
        // const newSourceLimit = Math.max(0, (sourceCat.budget_limit || 0) - amount);
        // await supabase.from('categories').update({ budget_limit: newSourceLimit }).eq('id', sourceId);

        // 4. Record transaction for Source via 'expense' type
        // This works because type 'expense' is allowed, and without wallet_id it won't affect balance.
        await supabase.from('transactions').insert({
            amount: amount,
            category_id: sourceId,
            type: 'expense',
            date: new Date().toISOString().split('T')[0],
            description: 'Transfer Pagu Anggaran',
            wallet_id: null // Does not affect wallet balance
        });

        // 5. Update Target Limit
        const newTargetLimit = (targetCat.budget_limit || 0) + amount;
        await supabase.from('categories').update({ budget_limit: newTargetLimit }).eq('id', targetId);
    },

    updateTransaction: async (id, oldTx, newTx) => {
        // 1. Revert Old Transaction effects
        if (oldTx.type === 'expense') {
            // Restore Wallet Balance
            if (oldTx.wallet_id) {
                const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', oldTx.wallet_id).single();
                if (wallet) {
                    await supabase.from('wallets').update({ balance: wallet.balance + oldTx.amount }).eq('id', oldTx.wallet_id);
                }
            }
            // Restore Category Budget
            if (oldTx.category_id) {
                const { data: cat } = await supabase.from('categories').select('budget_limit').eq('id', oldTx.category_id).single();
                if (cat) {
                    await supabase.from('categories').update({ budget_limit: (cat.budget_limit || 0) + oldTx.amount }).eq('id', oldTx.category_id);
                }
            }
        } else if (oldTx.type === 'income') {
            // Restore Wallet Balance (Deduct income)
            if (oldTx.wallet_id) {
                const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', oldTx.wallet_id).single();
                if (wallet) {
                    await supabase.from('wallets').update({ balance: wallet.balance - oldTx.amount }).eq('id', oldTx.wallet_id);
                }
            }
        }

        // 2. Update Transaction Record
        const { error } = await supabase.from('transactions').update(newTx).eq('id', id);
        if (error) throw error;

        // 3. Apply New Transaction Effects
        if (newTx.type === 'expense') {
            // Deduct Wallet Balance
            if (newTx.wallet_id) {
                const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', newTx.wallet_id).single();
                if (wallet) {
                    await supabase.from('wallets').update({ balance: wallet.balance - newTx.amount }).eq('id', newTx.wallet_id);
                }
            }
            // Deduct Category Budget
            if (newTx.category_id) {
                const { data: cat } = await supabase.from('categories').select('budget_limit').eq('id', newTx.category_id).single();
                if (cat) {
                    await supabase.from('categories').update({ budget_limit: (cat.budget_limit || 0) - newTx.amount }).eq('id', newTx.category_id);
                }
            }
        } else if (newTx.type === 'income') {
            // Add Wallet Balance
            if (newTx.wallet_id) {
                const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', newTx.wallet_id).single();
                if (wallet) {
                    await supabase.from('wallets').update({ balance: wallet.balance + newTx.amount }).eq('id', newTx.wallet_id);
                }
            }
        }
    },

    // Fuel Logs
    getFuelLogs: async (month, year) => {
        let query = supabase.from('fuel_logs').select('*').order('date', { ascending: false });

        if (month !== undefined && year !== undefined) {
            const startDate = new Date(year, month, 1).toLocaleDateString('en-CA');
            const endDate = new Date(year, month + 1, 0).toLocaleDateString('en-CA');
            query = query.gte('date', startDate).lte('date', endDate);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    createFuelLog: async (log) => {
        const { data, error } = await supabase.from('fuel_logs').insert(log).select();
        if (error) throw error;
        return data[0];
    },

    updateFuelLog: async (id, updates) => {
        const { data, error } = await supabase.from('fuel_logs').update(updates).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    deleteFuelLog: async (id) => {
        const { error } = await supabase.from('fuel_logs').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};
