import { config } from 'dotenv';
import { default as axios } from 'axios';

config();

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_KEY;

export const getTokenTransactions = async (address) => {
    const networks = [
        { name: 'Ethereum', baseURL: 'https://api.etherscan.io/api' },
        { name: 'Arbitrum', baseURL: 'https://api.arbiscan.io/api' }
    ];

    const transactionPromises = networks.map(async (network) => {
        const url = `${network.baseURL}?module=account&action=tokentx&address=${address}&sort=desc&apikey=${ETHERSCAN_API_KEY}`;

        try {
            const response = await axios.get(url);
            if (response.data.status === "1") {
                return {
                    network: network.name,
                    transactions: response.data.result
                };
            } else {
                return {
                    network: network.name,
                    transactions: [],
                    error: response.data.message
                };
            }
        } catch (error) {
            return {
                network: network.name,
                transactions: [],
                error: error.message
            };
        }
    });

    const results = await Promise.all(transactionPromises);

    return results;
};
