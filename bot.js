const { Telegraf } = require('telegraf');
const fs = require('fs');

const bot = new Telegraf(process.env.BOT_TOKEN);
require('dotenv').config();

let bannedUsers;
try {
  bannedUsers = JSON.parse(fs.readFileSync('spam-users-id.json', 'utf8'));
} catch (error) {
  console.error(error);
  bannedUsers = [];
  fs.writeFileSync('spam-users-id.json', JSON.stringify(bannedUsers));
}

bot.command('add', (ctx) => {
  if (ctx.from.id === xxxxxxxx) {
    const message = ctx.message;
    const userId = message.reply_to_message.from.id;
    if (!bannedUsers.includes(userId)) {
      ctx.telegram.KickChatMember(message.chat.id, userId)
      bannedUsers.push(userId);
      fs.writeFileSync('spam-users-id.json', JSON.stringify(bannedUsers));
      ctx.reply(`L'utilisateur ${message.reply_to_message.from.first_name} a été ajouté à la liste des utilisateurs marqués comme Spam/Bot et a été banni du groupe.`);
    } else {
      ctx.reply(`L'utilisateur ${message.reply_to_message.from.first_name} a été ajouté à la liste des utilisateurs marqués comme Spam/Bot.`);
    }
  } else {
    ctx.reply(`Vous n'êtes pas autorisé à ajouter des utilisateurs à la liste des utilisateurs bannis.`);
  }
});


bot.command('deleteid', (ctx) => {
  if (ctx.from.id === xxxxxxxx) {
    const message = ctx.message;
    const userId = message.reply_to_message.from.id;
    const index = bannedUsers.indexOf(userId);
    if (index > -1) {
      bannedUsers.splice(index, 1);
      fs.writeFileSync('spam-users-id.json', JSON.stringify(bannedUsers));
      ctx.reply(`L'utilisateur ${message.reply_to_message.from.first_name} a été retiré de la liste des utilisateurs marqués comme Spam/Bot.`);
    } else {
      ctx.reply(`L'utilisateur ${message.reply_to_message.from.first_name} n'a pas été retiré de la liste des utilisateurs marqués comme Spam/Bot.`);
    }
  } else {
    ctx.reply(`Vous n'êtes pas autorisé à retirer des utilisateurs de la liste des utilisateurs bannis.`);
  }
});

bot.command('count', (ctx) => {
  ctx.reply(`La liste des utilisateurs marqués comme Spam/Bot contient ${bannedUsers.length} utilisateurs.`);
});

bot.command('list', (ctx) => {
  if (bannedUsers.length > 0) {
      ctx.reply(`Liste des utilisateurs marqués comme Spam/Bot : ${bannedUsers.join(', ')}`);
  } else {
      ctx.reply(`Aucun utilisateur n'est marqué comme Spam/Bot.`);
  }
});

bot.on('new_chat_members', (ctx) => {
  const userId = ctx.message.new_chat_participant.id;
  if (bannedUsers.includes(userId)) {
    ctx.telegram.kickChatMember(ctx.message.chat.id, userId);
    const userName = ctx.message.new_chat_participant.first_name;
    ctx.reply(` L'utilisateur ${userName}, a été banni et a été marqué comme Spam/Bot.`);
  }
});

bot.catch((err) => {
    console.log('Erreur : ', err)
});

const startBot = async () => {
	try {
		await bot.launch();
		console.log('✅ - BanByID-FR démarré avec succès.');
	} catch(error) {
		console.error(error);
	}
}

startBot();
