import { AUTHORIZED_USERS } from "../constants.js";

export const isAuthorized = (userId) => AUTHORIZED_USERS.includes(userId.toString());

export const separateBySpaces = (number) => {
    const reversedNumber = String(number).split('').reverse().join('');
    const separatedNumber = reversedNumber.replace(/(\d{3})(?=\d)/g, '$1,');

    return separatedNumber.split('').reverse().join('');
};

export const stringRepresentation = (obj) => Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

export const help = (bot, chatId) => {
    return bot.sendMessage(
        chatId,
        `Available commands:\n/getticker - Get data about pair, format: '/getticker btc'\n/snipe exchanges | price change (%) | pairs - Find arbitrage\n/snipe - Snipe for token price changes, format: /snipe binance,mexc 15`,
    );
};
