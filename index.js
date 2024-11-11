import TelegramBot from 'node-telegram-bot-api';
import { config } from 'dotenv';

import { isAuthorized, help } from './src/helpers/helpers.js';

import { snipePumpAndDump } from './src/commands/snipePumpAndDump/index.js';
import { sendPumpsAndDumpsExchanges, sendArbitrageMenu, sendPumpAndDumpsMenu } from './src/callbackQueries/arbitrage/index.js';
import { connectDB } from './src/db/connectdb.js';

import { logErrorToFile } from './src/helpers/logError.js';
import { changePumpAndDumpExchanges, changePumpAndDumpStatus } from './src/callbackQueries/arbitrage/helpers.js';
import { addUserToDB, getUserSettings, toggleSelectedExchange, toggleUserIsEnabled } from './src/helpers/db.js';
import { addAuthorizedUser, isUserAuthorized } from './src/helpers/utils.js';

import { ADMIN_USER_ID, AUTHORIZED_USERS } from './src/constants.js';
import { MARKUP_TEMPLATES } from './src/markupTemplates/index.js';

config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_KEY, { polling: true });

(async () => {
    await connectDB();
    console.log('Bot is running...');
})();

// Higher-order function for authorization
const withAuthorization = (handler) => (msg, ...args) => {
    const userId = msg?.from?.id;
    const chatId = msg?.chat?.id;

    if (!userId || !isAuthorized(userId)) {
        return bot.sendMessage(chatId, '⛔️ You are not authorized to interact with this bot.');
    }

    return handler(msg, ...args);
};

// Notify the admin if someone tries to use the bot
bot.onText(/.*/, ({ from }) => {
    if (from.id.toString() !== ADMIN_USER_ID) {
        bot.sendMessage(ADMIN_USER_ID, `Somebody trying to use me.\nHere is the info: ${JSON.stringify(from)}`);
    }
});

// Handle start command and show the main menu
bot.onText(/\/start/, withAuthorization(async ({ chat, from }) => {
    const userId = from.id;
    const userName = from.username || from.first_name;

    await addUserToDB(userId, userName);

    bot.sendMessage(
        chat.id,
        '⬇️ Choose an option',
        MARKUP_TEMPLATES.START_MENU,
    );
}));

// Handle buttons
bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const userId = callbackQuery.from.id;
    const callbackQueryValue = callbackQuery.data;

    console.log(userId);

    if (callbackQueryValue === 'wallets_tracking') {
        bot.sendMessage(message.chat.id, 'Wallets menu, please choose an option', MARKUP_TEMPLATES.WALLETS_TRACKING).then(() => {
            bot.answerCallbackQuery(callbackQuery.id);
        });
    } else if (callbackQueryValue === 'currencies_tracking') {
        bot.sendMessage(message.chat.id, 'Wallets menu, please choose an option', MARKUP_TEMPLATES.CURRENCIES_TRACKING).then(() => {
            bot.answerCallbackQuery(callbackQuery.id);
        });
    }

    if (callbackQueryValue === 'arbitrage_main') {
        sendArbitrageMenu(bot, message.chat.id, callbackQuery.id);
    }

    if (callbackQueryValue === 'pumps_and_dumps') {
        sendPumpAndDumpsMenu(bot, message.chat.id, callbackQuery.id, userId);
    }

    if (callbackQueryValue === 'pumps_and_dumps_exchanges_list') {
        sendPumpsAndDumpsExchanges(bot, message.chat.id, callbackQuery.id, userId);
    }

    if (callbackQueryValue === 'is_pumps_and_dumps_enabled') {
        const isPumpsAndDumpsEnabled = await toggleUserIsEnabled(userId);
        const userSettings = await getUserSettings(userId);

        changePumpAndDumpStatus(bot, message, userId);

        if (isPumpsAndDumpsEnabled) {
            snipePumpAndDump(bot, message.chat.id, userSettings.pumpsAndDumps);
        } else {
            return;
        }
    }

    if (callbackQueryValue.startsWith('pd_exchange_')) {
        const exchangeClicked = callbackQueryValue.replace('pd_exchange_', '');

        await toggleSelectedExchange(userId, exchangeClicked);
        changePumpAndDumpExchanges(bot, message, userId, exchangeClicked);
    }
});

// Add user to the authorized list
bot.onText(/\/adduser/, withAuthorization(({ chat, from }, match) => {
    const chatId = chat?.id;
    const userId = from?.id;

    try {
        if (!isAdmin(userId)) {
            return bot.sendMessage(chatId, 'You are not authorized to add users.');
        }

        const newUserId = extractUserId(match);
        if (!newUserId || isUserAuthorized(newUserId)) {
            return bot.sendMessage(chatId, 'Invalid user ID or user already authorized.');
        }

        addAuthorizedUser(newUserId);
        bot.sendMessage(chatId, `User ${newUserId} has been added to the authorized list.`);
        bot.sendMessage(chatId, `Authorized users: ${AUTHORIZED_USERS}`);

    } catch (error) {
        logErrorToFile(error, chatId, bot);
    }
}));

bot.onText(/\/help/, ({ chat }) => {
    help(bot, chat?.id);
});
