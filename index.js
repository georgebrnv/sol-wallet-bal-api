const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

var pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
});

app.get('/wallet-balance/:wallet_address', async (req, res) => {
    const wallet_address = req.params.wallet_address;
    
    try {
        
        // First query to get walletId
        const walletIdQuery = 'SELECT id FROM wallet_solanawallet WHERE solana_wallet_address = $1';
        const walletIdResult = await pool.query(walletIdQuery, [wallet_address]);

        if (walletIdResult.rows.length === 0) {
            return res.status(404).json({ error: "Wallet address not found. Go to 'trackoff.app' to create profile and connect your wallet to start generating wallet balance data." });
        }

        const walletId = walletIdResult.rows[0].id;

        // Second query to get userId
        const userIdQuery = 'SELECT id FROM authentication_userauth WHERE solana_wallet_id = $1';
        const userIdResult = await pool.query(userIdQuery, [walletId]);
        const userId = userIdResult.rows[0].id;

        // Third query to get balance data
        const balanceQuery = 'SELECT * FROM snapshot_walletsnapshot WHERE user_id = $1';
        const balanceDataResult = await pool.query(balanceQuery, [userId]);
        const balanceData = balanceDataResult.rows;

        res.json(balanceData);

    } catch (err) {
        console.error('Error: ', err.stack);
        res.status(500).json({ error: 'Internal server error '});
    };

});

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:${PORT}');
});