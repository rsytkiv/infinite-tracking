import { logErrorToFile } from '../../helpers/logError.js';
import { fetchDataFromChosenExchanges } from '../fetchDataFromChosenExchanges/index.js';
import { sendMessageWithHTML } from '../../helpers/utils.js';

import { PRICE_CHANGE_THRESHOLD, DEFAULT_EXCHANGES } from '../../constants.js';

const TIME_WINDOW = 10 * 60 * 1000;

const priceHistory = {};
const sentOpportunities = new Set();

export const snipePumpAndDump = async (bot, chatId , userPumpsAndDumpsSettings) => {
    try {
        const { exchanges, percentage } = userPumpsAndDumpsSettings;
        let currentPrices = [];

        console.log('working...');
        sendMessageWithHTML(bot, chatId, `<b>Sniping started with the following options:</b>\n\n<b>Exchanges:</b> ${exchanges.join(', ')}\n<b>Percentage:</b> ${percentage}%`);

        currentPrices = await fetchDataFromChosenExchanges(exchanges, currentPrices, bot, chatId);

        const now = Date.now();
        const arbitrageOpportunities = [];

        currentPrices?.forEach(({ symbol, price, exchange, volume }) => {
            if (!priceHistory[symbol]) {
                priceHistory[symbol] = [];
            }

            priceHistory[symbol].push({ time: now, price });

            // Remove old prices outside the time window
            priceHistory[symbol] = priceHistory[symbol].filter(p => now - p.time <= TIME_WINDOW);

            // Check for price changes within the time window
            const oldestPrice = priceHistory[symbol][0].price;
            const priceChange = ((price - oldestPrice) / oldestPrice) * 100;

            // Check for price pumps (positive change) and dumps (negative change)
            if (Math.abs(priceChange) >= percentage) {
                const direction = priceChange > 0 ? 'pump' : 'dump';
                const opportunity = `<code>${symbol}</code>: ${priceChange.toFixed(2)}% ${direction} (Old: ${oldestPrice} ➡️ New: ${price})\n<b>Volume:</b> ${volume} \n<b>Exchange:</b> ${exchange}`;

                // Check if this opportunity has already been sent
                if (!sentOpportunities.has(symbol)) {
                    sentOpportunities.add(symbol); // Mark this opportunity as sent
                    arbitrageOpportunities.push(opportunity);
                }
            }
        });

        // Send alerts for arbitrage opportunities
        if (arbitrageOpportunities.length > 0) {
            for (let opportunity of arbitrageOpportunities) {
                sendMessageWithHTML(bot, chatId, `⚠️ <b>Price change detected:</b>\n\n${opportunity}`);
            }
        }
    } catch (error) {
        console.error('Error in main sniper block:', error);

        logErrorToFile(error, chatId, bot);
    }
};

export default {
    snipePumpAndDump,
};
