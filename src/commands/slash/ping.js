import { SlashCommandBuilder } from "@discordjs/builders";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pong"),
    run: async (client, interaction) => {
        interaction.reply('pong')
    }
};
