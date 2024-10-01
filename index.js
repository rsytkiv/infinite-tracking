const TelegramBot = require('node-telegram-bot-api');

const { isAuthorized, help } = require('./src/helpers/helpers');

const {
    ADMIN_USER_ID,
    AUTHORIZED_USERS,
} = require('./src/constants');
const { logErrorToFile } = require('./src/helpers/logError');
const { getTokenTransactions } = require('./src/commands/watchWalletsTransactions');

require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_KEY, { polling: true });

// Higher-order function for authorization
const withAuthorization = (handler) => {
    return (msg, ...args) => {
        const { chat, from } = msg;
        if (!isAuthorized(from?.id)) {
            return bot.sendMessage(chat?.id, '⛔️ You are not authorized to interact with this bot.');
        }
        return handler(msg, ...args);
    };
};

// Notify the admin if someone tries to use the bot
bot.onText(/.*/, ({ from }) => {
    if (from.id.toString() !== ADMIN_USER_ID) {
        bot.sendMessage(ADMIN_USER_ID, `Somebody trying to use me.\nHere is the info: ${JSON.stringify(from)}`);
    }
});

// Handle start command and show the main menu
bot.onText(/\/start/, withAuthorization(async ({ chat }) => {
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '💳 Wallets trackingh', callback_data: 'wallets_tracking' },
                    { text: '💳 Currencies', callback_data: 'currencies_tracking' },
                    { text: '🪙 Tokens', callback_data: 'button2' }
                ]
            ]
        }
    };

    bot.sendMessage(chat.id, '⬇️ Choose an option', options);

    const address = '0xbdcd88b1967b6e0e47df420e5882286776e74afb'; // Replace with your actual Ethereum/Arbitrum address

    getTokenTransactions(address)
    .then((results) => {
        results.forEach((result) => {
            console.log(`Transactions on ${result.network}:`);
            if (result.error) {
                console.log(`Error: ${result.error}`);
            } else {
                console.log(result.transactions);
            }
        });
    })
    .catch((error) => {
        console.error('An error occurred:', error);
    });
}));

// Handle buttons
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const backArray = ['wallet_menu_back', 'currencies_menu_back'];

    if (data === 'wallets_tracking') {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📋 Wallets list', callback_data: 'wallets_list' },
                        { text: '➕ Add wallet', callback_data: 'add_wallet' },
                        { text: '➖ Remove wallet', callback_data: 'remove_wallet' },
                    ],
                    [
                        { text: '👈🏻 Back', callback_data: 'wallet_menu_back' }
                    ]
                ],
            }
        };

        bot.sendMessage(message.chat.id, 'Wallets menu, please choose an option', options).then(() => {
            bot.answerCallbackQuery(callbackQuery.id);
        });
    } else if (data === 'currencies_tracking') {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📋 Currencies list', callback_data: 'currencies_list' },
                        { text: '➕ Add coin', callback_data: 'add_coin' },
                        { text: '➖ Remove coin', callback_data: 'remove_coin' },
                    ],
                    [
                        { text: '👈🏻 Back', callback_data: 'currencies_menu_back' }
                    ]
                ],
            }
        };

        bot.sendMessage(message.chat.id, 'Wallets menu, please choose an option', options).then(() => {
            bot.answerCallbackQuery(callbackQuery.id);
        });
    }
});

// Add user to the authorized list
bot.onText(/\/adduser/, withAuthorization(({ chat, from }, match) => {
    const chatId = chat?.id;
    const userId = from?.id;

    try {
        // Check if the sender is the admin
        if (userId.toString() === ADMIN_USER_ID) {
            const newUserId = parseInt(match?.input.split(' ')[1], 10).toString();

            if (newUserId && !AUTHORIZED_USERS.includes(newUserId)) {
                AUTHORIZED_USERS.push(newUserId);

                bot.sendMessage(chatId, `User ${newUserId} has been added to the authorized list.`);
                bot.sendMessage(chatId, `Authorized users: ${AUTHORIZED_USERS}`);
            } else {
                bot.sendMessage(chatId, 'Invalid user ID or user already authorized.');
            }
        } else {
            bot.sendMessage(chatId, 'You are not authorized to add users.');
        }
    } catch (error) {
        logErrorToFile(error, chatId, bot);
    }
}));

bot.onText(/\/help/, ({ chat }) => {
    help(bot, chat?.id);
});
