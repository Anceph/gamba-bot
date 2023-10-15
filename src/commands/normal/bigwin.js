import { EmbedBuilder } from "discord.js";

export default {
    name: "bigwin",
    aliases: ["win", "big"],
    cooldown: 500,
    run: async (client, message, args) => {

        const embed = new EmbedBuilder()
            .setTitle('BIG WIN! 🤑💵💯')
            .setColor(0x008000)
            .setImage('https://media0.giphy.com/media/lXGJ2MRfWIqMBHevW0/giphy.gif')

        message.reply({ embeds: [embed] })
    }
};
