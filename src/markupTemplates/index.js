export const MARKUP_TEMPLATES = {
    START_MENU: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '💳 Wallets', callback_data: 'wallets_tracking' },
                    { text: '💱 Currencies', callback_data: 'currencies_tracking' },
                    { text: '🪙 Tokens', callback_data: 'tokens_tracking' },
                ],
                [
                    { text: '📊 Arbitrage notifications', callback_data: 'arbitrage_main' },
                ],
            ],
        },
    },
    WALLETS_TRACKING: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📋 Wallets list', callback_data: 'wallets_list' },
                    { text: '➕ Add wallet', callback_data: 'add_wallet' },
                    { text: '➖ Remove wallet', callback_data: 'remove_wallet' },
                ],
                [
                    { text: '👈🏻 Back', callback_data: 'wallet_menu_back' },
                ],
            ],
        },
    },
    CURRENCIES_TRACKING: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '📋 Currencies list', callback_data: 'currencies_list' },
                    { text: '➕ Add coin', callback_data: 'add_coin' },
                    { text: '➖ Remove coin', callback_data: 'remove_coin' },
                ],
                [
                    { text: '👈🏻 Back', callback_data: 'currencies_menu_back' },
                ],
            ],
        },
    },
    ARBITRAGE_MENU: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '〽️ Pumps & dumps', callback_data: 'pumps_and_dumps' },
                ],
            ],
        },
    },
};
