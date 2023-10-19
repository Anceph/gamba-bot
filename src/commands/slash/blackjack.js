import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("GAMBA time!!!!"),
    run: async (client, interaction) => {
        return interaction.reply({ text: 'daha yok baybay', ephemeral: true })

        // TODO: BURAYI KOMPLE YAP
        // TODO: BURAYI KOMPLE YAP
        // TODO: BURAYI KOMPLE YAP

        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        userData.save()

        const balance = userData.balance.toFixed(2)

        const embed = new EmbedBuilder()
            .setDescription(`$${balance}`)
            .setColor('Yellow')
            .setThumbnail(user.displayAvatarURL())

        return interaction.reply({ embeds: [embed] })
    }
};
