require('dotenv').config(); // Načtení proměnných z .env souboru

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

// Nastavení prefixu pro příkazy
const prefix = '!';

// Původní cena měny
let cena = 100;

// Objekt uživatelů a jejich stav
const users = {};

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    if (!users[message.author.id]) { users[message.author.id] = { money: 10000, currency: 0 } }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Příkaz pro zjištění stavu účtu
    if (command === 'stav') {
        const userBalance = users[message.author.id] || { money: 0, currency: 0 };
        message.channel.send(`Máte ${userBalance.money} zimbabwských dolarů a ${userBalance.currency} matmaroinů.`);
    }

    // Příkaz pro zjištění ceny měny
    if (command === 'cena') {
        message.channel.send(`Aktuální cena jednoho matmaroinu je: ${cena} zimbabwských dolarů`);
    }

    // Příkaz pro nákup měny
    if (command === 'koupit') {
        const amount = parseInt(args[0]);
        if (!amount || isNaN(amount) || amount <= 0) {
            return message.channel.send('Neplatné množství.');
        }

        const cost = amount * cena;
        const userBalance = users[message.author.id] || { money: 0, currency: 0 };
        if (cost > userBalance.money) {
            return message.channel.send('Nemáte dostatek zimbabwských dolarů.');
        }

        users[message.author.id].money -= cost;
        users[message.author.id].currency += amount;
        message.channel.send(`Koupili jste ${amount} matmaroinů za ${cost} zimbabwských dolarů.`);
        cena += amount; // Zvýšení ceny měny po nákupu
    }

    // Příkaz pro prodej měny
    if (command === 'prodat') {
        const amount = parseInt(args[0]);
        if (!amount || isNaN(amount) || amount <= 0) {
            return message.channel.send('Neplatné množství.');
        }

        const userBalance = users[message.author.id] || { money: 0, currency: 0 };
        if (amount > userBalance.currency) {
            return message.channel.send('Nemáte dostatek matmaroinů k prodeji.');
        }

        const earnings = amount * cena;
        users[message.author.id].money += earnings;
        users[message.author.id].currency -= amount;
        message.channel.send(`Prodali jste ${amount} matmaroinů za ${earnings} zimbabwských dolarů.`);
        cena -= amount; // Snížení ceny měny po prodeji
    }

    // Příkaz pro poslání peněz uživateli
    if (command === 'give') {
        const recipient = message.mentions.users.first();
        if (!recipient) return message.channel.send('Neplatný uživatel.');

        const amount = parseInt(args[1]);
        if (!amount || isNaN(amount) || amount <= 0) {
            return message.channel.send('Neplatné množství.');
        }

        const senderBalance = users[message.author.id] || { money: 0, currency: 0 };
        if (amount > senderBalance.money) {
            return message.channel.send('Nemáte dostatek zimbabwských dolarů.');
        }

        if (recipient.id === message.author.id) { // Kontrola zda uživatel neobchoduje sám se sebou
            return message.channel.send('Nemůžete poslat zimbabwské dolary sami sobě.');
        }

        users[message.author.id].money -= amount;
        users[recipient.id] = users[recipient.id] || { money: 0, currency: 0 };
        users[recipient.id].money += amount;
        message.channel.send(`Poslali jste ${amount} zimbabwských dolarů uživateli ${recipient}.`);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN); // Použití tokenu z .env souboru

