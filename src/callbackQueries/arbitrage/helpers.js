import { getPumpsAndDumpsSettings } from "../../helpers/db.js";

export const changePumpAndDumpStatus = async (bot, message, userId) => {
    const isPumpsAndDumpsEnabled = await getPumpsAndDumpsSettings(userId, 'isEnabled');

    const updatedKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: `Enabled ${isPumpsAndDumpsEnabled ? '✅' : '❌'}`, callback_data: 'is_pumps_and_dumps_enabled' },
                    { text: '📋 Exchanges list', callback_data: 'pumps_and_dumps_exchanges_list' },
                    { text: 'Change ％', callback_data: 'pumps_and_dumps_percentage' }
                ]
            ],
        }
    };

    // Edit the message to update the keyboard with the new icon
    bot.editMessageReplyMarkup(updatedKeyboard.reply_markup, {
        chat_id: message.chat.id,
        message_id: message.message_id,
    });
};

export const changePumpAndDumpExchanges = async (bot, message, userId) => {
    const pumpsAndDumpsExchanges = await getPumpsAndDumpsSettings(userId, 'exchanges');
    const binanceIcon = pumpsAndDumpsExchanges.includes('binance') ? '✅' : '❌';
    const bybitIcon = pumpsAndDumpsExchanges.includes('bybit') ? '✅' : '❌';

    const updatedKeyboard = {
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

    // Edit the message to update the keyboard with the new icon
    bot.editMessageReplyMarkup(updatedKeyboard.reply_markup, {
        chat_id: message.chat.id,
        message_id: message.message_id,
    });
};
