import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your balance"),
    run: async (client, interaction) => {
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        userData.save()

        const balance = userData.balance.toFixed(2)

        const embed = new EmbedBuilder()
            .setDescription(`$${balance}`)
            .setColor('Yellow')
            .setThumbnail(user.displayAvatarURL())

        if (userData.role == 1) {
            embed.setTitle(`💎 ${user.username}'s balance`)
            embed.setFooter({ text: 'Premium Account' })
        } else if (userData.role == 2) {
            embed.setTitle(`🛠️ ${user.username}'s balance`)
        } else if (userData.role == 0) {
            embed.setTitle(`${user.username}'s balance`)
        }

        if (userData.devMode) embed.setFooter({ text: '⚙️ Testing Mode' })

        return interaction.reply({ embeds: [embed] })
    }
};
