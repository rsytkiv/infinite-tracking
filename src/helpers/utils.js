import { AUTHORIZED_USERS } from "../constants.js";

export const sendMessageWithHTML = async (bot, chatId, message) => {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};

export const getTextAfterPrefix = (str) => {
    return str.replace('pd_exchange_', '');
};

export const isAdmin = (userId) => {
    return userId?.toString() === ADMIN_USER_ID;
};

export const extractUserId = (match) => {
    return parseInt(match?.input.split(' ')[1], 10)?.toString();
};

export const isUserAuthorized = (userId) => {
    return AUTHORIZED_USERS.includes(userId);
};

export const addAuthorizedUser = (userId) => {
    AUTHORIZED_USERS.push(userId);
};
