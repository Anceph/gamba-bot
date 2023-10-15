export default {
    name: "ping",
    aliases: [],
    cooldown: 5000,
    run: async (client, message, args) => {
        message.reply('pong')
    }
};
