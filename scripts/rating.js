const { Client } = require('pg');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

async function checkRating() {
    try {
        const client = new Client({
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            host: 'mineshare.top',
            port: 5432,
            database: 'mineshare_v2',
        });

        await client.connect();

        const result = await client.query(`SELECT * FROM servers WHERE ban = false;`);
        const servers = result.rows;

        for (const server of servers) {
            try {
                let rate = 10;

                if (server.banner != 'default-server-picture.gif') rate = rate + 10;
                if (server.premium_status) rate = rate + 10;
                if (server.verification) rate = rate + 10;
                if (server.current_players >= 5) rate = rate + 10;
                if (server.current_players >= 40) rate = rate + 10;
                if (server.current_players >= 100) rate = rate + 10;

                console.log(`${server.ip}: ${rate}★`);
                await client.query(`UPDATE servers SET rate = $1 WHERE ip = $2;`, [rate, server.ip]);
            } catch (error) {
                console.error(error.message);
            }
        }

        await client.end();

        console.log('------------------------------------------------');
    } catch (error) {
        console.error('Ошибка при подключении к базе данных:', error.message);
    }
}

setInterval(checkRating, 30000);