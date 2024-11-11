import { User } from "../db/models/User.js";

export const addUserToDB = async (userId, userName) => {
    try {
        // Check if the user already exists in the database
        const existingUser = await User.findOne({ userId });

        if (!existingUser) {
            // If user doesn't exist, create and save a new user
            const newUser = new User({ userId, userName });
            await newUser.save();
            console.log(`User added: ${userName} (${userId})`);
        } else {
            console.log(`User already exists: ${userName} (${userId})`);
        }
    } catch (error) {
        console.error('Error adding user to the database:', error);
    }
};

// Function to toggle the isEnabled field in the settings of a user
export const toggleUserIsEnabled = async (userId) => {
    try {
        const user = await User.findOne({ userId });

        if (user) {
            const currentIsEnabled = user.settings.pumpsAndDumps.isEnabled;
            const newIsEnabled = !currentIsEnabled;

            user.settings.pumpsAndDumps.isEnabled = !currentIsEnabled;
            user.markModified('settings.pumpsAndDumps.isEnabled');
            await user.save();

            console.log(`User ${user.userName}'s settings updated to isEnabled: ${newIsEnabled}`);

            return newIsEnabled;
        } else {
            console.log(`User with ID ${userId} not found.`);
            return null;
        }
    } catch (error) {
        console.error('Error toggling user settings:', error);
        throw error;
    }
};

export const toggleSelectedExchange = async (userId, exchange) => {
    try {
        const user = await User.findOne({ userId });

        if (!user) {
            console.log(`User with ID ${userId} not found.`);
            return null;
        }

        const exchanges = user.settings.pumpsAndDumps.exchanges;

        if (!exchanges.includes(exchange)) {
            exchanges.push(exchange);
        } else {
            const index = exchanges.indexOf(exchange);
            exchanges.splice(index, 1);
        }

        user.markModified('settings.pumpsAndDumps.exchanges');
        await user.save();

        console.log(`User ${user.userName}'s settings updated, exchanges: ${exchanges.toString()}`);

        return exchanges;
    } catch (error) {
        console.error('Error toggling user settings:', error);
        throw error;
    }
};

export const getPumpsAndDumpsSettings = async (userId, value) => {
    const key = `settings.pumpsAndDumps.${value}`;

    try {
        const user = await User.findOne(
            { userId },
            { [key]: 1 },
        );

        if (user && user.settings && user.settings.pumpsAndDumps) {
            return user.settings.pumpsAndDumps[value];
        } else {
            console.log(`User with ID ${userId} not found or settings not defined.`);
            return null;
        }
    } catch (error) {
        console.error('Error retrieving pumpsAndDumps.isEnabled:', error);
        throw error;
    }
};

// Function to retrieve the settings object for a user
export const getUserSettings = async (userId) => {
    try {
        const user = await User.findOne(
            { userId },
            { settings: 1 }
        );

        if (user && user.settings) {
            return user.settings;
        } else {
            console.log(`User with ID ${userId} not found or settings not defined.`);
            return null;
        }
    } catch (error) {
        console.error('Error retrieving user settings:', error);
        throw error;
    }
};
