const sendMessageWithHTML = async (bot, chatId, message) => {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
};

module.exports = {
    sendMessageWithHTML
};
