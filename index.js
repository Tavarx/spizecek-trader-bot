require('dotenv').config(); // Načtení proměnných z .env souboru

const { Client, GatewayIntentBits } = require('discord.js');
const { Sequelize, DataTypes } = require('sequelize');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

// Připojení k SQLite databázi
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false
});

// Definice modelu pro uživatele
const User = sequelize.define('User', {
  discordId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  money: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10000
  },
  currency: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

// Definice modelu pro cenu měny
const CurrencyPrice = sequelize.define('CurrencyPrice', {
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  }
});

// Vytvoření inicializačního záznamu ceny měny
sequelize.sync().then(async () => {
    try {
        const currencyPriceCount = await CurrencyPrice.count();
        if (currencyPriceCount === 0) {
            await CurrencyPrice.create({ price: 100 }); // inicializace ceny měny na 100
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Vytvoření tabulek v databázi (pokud neexistují)
sequelize.sync();

const prefix = '!'; // Definice prefixu pro příkazy

client.once('ready', () => {
  console.log('Ready!');
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

if (command === 'help') {
    // Zde můžete vytvořit embed pro lepší vizuální vzhled nápovědy
    const helpMessage = `
        **Nápověda: Dostupné příkazy**
        !stav: Zobrazí stav vašeho účtu.
        !cena: Zobrazí aktuální cenu jednoho matmaroinu.
        !koupit [množství]: Koupí zadané množství matmaroinů.
        !prodat [množství]: Prodej zadané množství matmaroinů.
        !give [uživatel] [množství]: Pošle zadané množství matmaroinů zadanému uživateli.
    `;
    message.channel.send(helpMessage);
}

  if (command === 'stav') {
    try {
      let user = await User.findOne({ where: { discordId: message.author.id } });
      if (!user) {
        user = await User.create({ discordId: message.author.id });
      }
      message.channel.send(`Máte ${user.money} zimbabwských dolarů a ${user.currency} matmaroinů.`);
    } catch (error) {
      console.error('Error:', error);
      message.channel.send('Došlo k chybě při zpracování požadavku.');
    }
  }

  if (command === 'cena') {
    try {
      const currencyPrice = await CurrencyPrice.findOne();
      message.channel.send(`Aktuální cena jednoho matmaroinu je: ${currencyPrice.price} zimbabwských dolarů`);
    } catch (error) {
      console.error('Error:', error);
      message.channel.send('Došlo k chybě při zpracování požadavku.');
    }
  }

	// Příkaz pro nákup měny
if (command === 'koupit') {
  const amount = parseInt(args[0]);
  if (!amount || isNaN(amount) || amount <= 0) {
    return message.channel.send('Neplatné množství.');
  }

  try {
    const user = await User.findOne({ where: { discordId: message.author.id } });
    const currencyPrice = await CurrencyPrice.findOne();

    const cost = amount * currencyPrice.price;
    if (cost > user.money) {
      return message.channel.send('Nemáte dostatek zimbabwských dolarů.');
    }

    user.money -= cost;
    user.currency += amount;
    await user.save();

    // Změna ceny měny po nákupu
    currencyPrice.price += amount;
    await currencyPrice.save();

    message.channel.send(`Koupili jste ${amount} matmaroinů za ${cost} zimbabwských dolarů.`);
  } catch (error) {
    console.error('Error:', error);
    message.channel.send('Došlo k chybě při zpracování požadavku.');
  }
}

// Příkaz pro prodej měny
if (command === 'prodat') {
  const amount = parseInt(args[0]);
  if (!amount || isNaN(amount) || amount <= 0) {
    return message.channel.send('Neplatné množství.');
  }

  try {
    const user = await User.findOne({ where: { discordId: message.author.id } });
    const currencyPrice = await CurrencyPrice.findOne();

    if (amount > user.currency) {
      return message.channel.send('Nemáte dostatek matmaroinů k prodeji.');
    }

    const earnings = amount * currencyPrice.price;
    user.money += earnings;
    user.currency -= amount;
    await user.save();

    // Změna ceny měny po prodeji
    currencyPrice.price -= amount;
    await currencyPrice.save();

    message.channel.send(`Prodali jste ${amount} matmaroinů za ${earnings} zimbabwských dolarů.`);
  } catch (error) {
    console.error('Error:', error);
    message.channel.send('Došlo k chybě při zpracování požadavku.');
  }
}


if (command === 'give') {
  const recipient = message.mentions.users.first();
  if (!recipient) return message.channel.send('Neplatný uživatel.');

  const amount = parseInt(args[1]);
  if (!amount || isNaN(amount) || amount <= 0) {
    return message.channel.send('Neplatné množství.');
  }

  try {
    const sender = await User.findOne({ where: { discordId: message.author.id } });
    const recipientUser = await User.findOne({ where: { discordId: recipient.id } });

    if (amount > sender.money) {
      return message.channel.send('Nemáte dostatek zimbabwských dolarů.');
    }

    if (recipient.id === message.author.id) {
      return message.channel.send('Nemůžete poslat zimbabwské dolary sami sobě.');
    }

    sender.money -= amount;
    recipientUser.money += amount;

    await sender.save();
    await recipientUser.save();

    message.channel.send(`Poslali jste ${amount} zimbabwských dolarů uživateli ${recipient}.`);
  } catch (error) {
    console.error('Error:', error);
    message.channel.send('Došlo k chybě při zpracování požadavku.');
  }
}


});

client.login(process.env.DISCORD_BOT_TOKEN); // Použití tokenu z .env souboru

