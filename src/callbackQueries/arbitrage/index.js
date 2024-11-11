import { getPumpsAndDumpsSettings, getUserSettings } from "../../helpers/db.js";
import { MARKUP_TEMPLATES } from "../../markupTemplates/index.js";

export const sendStartMenu = () => {

};

export const sendArbitrageMenu = (bot, messageId, callbackQueryId) => {
    bot.sendMessage(messageId, 'Wallets menu, please choose an option', MARKUP_TEMPLATES.ARBITRAGE_MENU).then(() => {
        bot.answerCallbackQuery(callbackQueryId);
    });
};

export const sendPumpAndDumpsMenu = async (bot, messageId, callbackQueryId, userId) => {
    const userSettings = await getUserSettings(userId);
    const isPumpsAndDumpsEnabled = userSettings?.pumpsAndDumps?.isEnabled;
    const pumpsAndDumpsIcon = isPumpsAndDumpsEnabled ? '✅' : '❌';

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: `Enabled ${pumpsAndDumpsIcon}`, callback_data: 'is_pumps_and_dumps_enabled' },
                    { text: '📋 Exchanges list', callback_data: 'pumps_and_dumps_exchanges_list' },
                    { text: 'Change ％', callback_data: 'pumps_and_dumps_percentage' }
                ]
            ],
        }
    };

    bot.sendMessage(messageId, 'Choose an option', options).then(() => {
        bot.answerCallbackQuery(callbackQueryId);
    });
}

export const sendPumpsAndDumpsExchanges = async (bot, messageId, callbackQueryId, userId) => {
    const pumpsAndDumpsExchanges = await getPumpsAndDumpsSettings(userId, 'exchanges');
    const binanceIcon = pumpsAndDumpsExchanges.includes('binance') ? '✅' : '❌';
    const bybitIcon = pumpsAndDumpsExchanges.includes('bybit') ? '✅' : '❌';

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: `Binance ${binanceIcon}`, callback_data: 'pd_exchange_binance' },
                    { text: `Bybit ${bybitIcon}`, callback_data: 'pd_exchange_bybit' },
                ],
                [
                    { text: 'OKX', callback_data: 'pd_okx' },
                    { text: 'Bitget', callback_data: 'pd_bitget' },
                ]
            ],
        }
    };

    bot.sendMessage(messageId, 'Choose an exchange to track', options).then(() => {
        bot.answerCallbackQuery(callbackQueryId);
    });
};
