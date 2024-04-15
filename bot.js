const { Telegraf } = require('telegraf');
const fs = require('fs');

const bot = new Telegraf(process.env.BOT_TOKEN);
require('dotenv').config();

let bannedUsers;

function isAdmin(idOfChat, IdOfUser, ctx) {
   return new Promise((resolve, reject) => {
       //Get user information first
       ctx.telegram.getChatMember(idOfChat, IdOfUser).then((user) => {
           //Then check if user is admin (or creator)
           resolve(user.status == "administrator" || user.status == "creator");
       })
       .catch((error) => {
            //Reject if it's an error
            reject(error);
       });
   });
}

try {
  bannedUsers = JSON.parse(fs.readFileSync('spam-users-id.json', 'utf8'));
} catch (error) {
  console.error(error);
  bannedUsers = [];
  fs.writeFileSync('spam-users-id.json', JSON.stringify(bannedUsers));
}

bot.command('add', (ctx) => {
  isAdmin(ctx.message.chat.id, ctx.message.from.id, ctx).then((result) => {
    if (result) {
      const message = ctx.message;
      try {
        const userId = message.reply_to_message.from.id;
      } catch (error) {
        ctx.reply(`Aucune réponse trouvée. Cette commande s'utilise en réponse à un message.`);
        return;
      }
      if (!bannedUsers.includes(userId)) {
        try {
          ctx.telegram.KickChatMember(message.chat.id, userId)
          ctx.reply(`L'utilisateur ${message.reply_to_message.from.first_name} (${userId}) a été banni du groupe.`);
        } catch (error) {
          ctx.reply(`L'utilisateur ${message.reply_to_message.from.first_name} (${userId}) n'a pas pu être banni du groupe.`);
        }
        bannedUsers.push(userId);
        try{
          fs.writeFileSync('spam-users-id.json', JSON.stringify(bannedUsers));
          ctx.reply(`L'utilisateur ${message.reply_to_message.from.first_name} (${userId}) a été ajouté à la liste des utilisateurs marqués comme Spam/Bot.`);
        } catch (error) {
          ctx.reply(`L'utilisateur ${message.reply_to_message.from.first_name} (${userId}) n'a pas pu être ajouté à la liste des utilisateurs marqués comme Spam/Bot.`);
        }
      } else {
        ctx.reply(`L'utilisateur ${message.reply_to_message.from.first_name} (${userId}) est déjà dans la liste des utilisateurs marqués comme Spam/Bot.`);
      }
    } else {
      ctx.reply(`Vous n'êtes pas autorisé à ajouter des utilisateurs à la liste des utilisateurs bannis.`);
    }
  })
  .catch((error) => {
    ctx.reply("Une erreur est survenue en essayant d'obtenir le statut de l'utilisateur : " + JSON.stringify(error));
  });
});

bot.command('addid', (ctx) => {
  isAdmin(ctx.message.chat.id, ctx.message.from.id, ctx).then((result) => {
    if (result) {
      const message = ctx.message;
      const userId = ctx.args[0];
      if (!bannedUsers.includes(userId)) {
        try {
          ctx.telegram.KickChatMember(message.chat.id, userId)
          ctx.reply(`L'utilisateur ${userId} a été banni du groupe.`);
        } catch (error) {
          ctx.reply(`L'utilisateur ${userId} n'a pas pu être banni du groupe.`);
        }
        bannedUsers.push(userId);
        try{
          fs.writeFileSync('spam-users-id.json', JSON.stringify(bannedUsers));
          ctx.reply(`L'utilisateur ${userId} a été ajouté à la liste des utilisateurs marqués comme Spam/Bot.`);
        } catch (error) {
          ctx.reply(`L'utilisateur ${userId} n'a pas pu être ajouté à la liste des utilisateurs marqués comme Spam/Bot.`);
        }
      } else {
        ctx.reply(`L'utilisateur ${userId} est déjà dans la liste des utilisateurs marqués comme Spam/Bot.`);
      }
    } else {
      ctx.reply(`Vous n'êtes pas autorisé à ajouter des utilisateurs à la liste des utilisateurs bannis.`);
    }
  })
  .catch((error) => {
    ctx.reply("Une erreur est survenue en essayant d'obtenir le statut de l'utilisateur : " + JSON.stringify(error));
  });
});


bot.command('deleteid', (ctx) => {
  isAdmin(ctx.message.chat.id, ctx.message.from.id, ctx).then((result) => {
    if (result) {
      const message = ctx.message;
      const userId = ctx.args[0];
      const index = bannedUsers.indexOf(userId);
      if (index > -1) {
        bannedUsers.splice(index, 1);
        fs.writeFileSync('spam-users-id.json', JSON.stringify(bannedUsers));
        ctx.reply(`L'utilisateur ${userId} a été retiré de la liste des utilisateurs marqués comme Spam/Bot.`);
      } else {
        ctx.reply(`L'utilisateur ${userId} n'a pas été retiré de la liste des utilisateurs marqués comme Spam/Bot.`);
      }
    } else {
      ctx.reply(`Vous n'êtes pas autorisé à retirer des utilisateurs de la liste des utilisateurs bannis.`);
    }
  })
  .catch((error) => {
    ctx.reply("Une erreur est survenue en essayant d'obtenir le statut de l'utilisateur : " + JSON.stringify(error));
  });
});

bot.command('count', (ctx) => {
  isAdmin(ctx.message.chat.id, ctx.message.from.id, ctx).then((result) => {
    if (result) {
      ctx.reply(`La liste des utilisateurs marqués comme Spam/Bot contient ${bannedUsers.length} utilisateurs.`);
    } else {
      ctx.reply(`Vous n'êtes pas autorisé à consulter le nombre des utilisateurs bannis.`);
    }
  })
  .catch((error) => {
    ctx.reply("Une erreur est survenue en essayant d'obtenir le statut de l'utilisateur : " + JSON.stringify(error));
  });
});

bot.command('list', (ctx) => {
  isAdmin(ctx.message.chat.id, ctx.message.from.id, ctx).then((result) => {
    if (result) {
      if (bannedUsers.length > 0) {
        ctx.reply(`Liste des utilisateurs marqués comme Spam/Bot : ${bannedUsers.join(', ')}`);
      } else {
        ctx.reply(`Aucun utilisateur n'est marqué comme Spam/Bot.`);
      }
    }
    else {
      ctx.reply(`Vous n'êtes pas autorisé à consulter la liste des utilisateurs bannis.`);
    }
  })
  .catch((error) => {
    ctx.reply("Une erreur est survenue en essayant d'obtenir le statut de l'utilisateur : " + JSON.stringify(error));
  });
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
