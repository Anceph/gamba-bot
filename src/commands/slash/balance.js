import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("test lol zaxd"),
    run: async (client, interaction) => {
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        userData.save()

        const balance = userData.balance.toFixed(2)

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s balance`)
            .setDescription(`$${balance}`)
            .setColor('Yellow')
            .setThumbnail(user.displayAvatarURL())

        return interaction.reply({ embeds: [embed] })
    }
};
