import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Your profile"),
    run: async (client, interaction) => {
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        userData.save()

        const balance = userData.balance.toFixed(2)

        const embed = new EmbedBuilder()
            .setThumbnail(user.displayAvatarURL())

        if (userData.role == 1) {
            embed.setTitle(`${user.username}'s Profile`)
            embed.addFields(
                { name: 'Role', value: '💎 Premium' },
                { name: 'Balance', value: `$${balance}` },
            )
            embed.setColor('Gold')
        } else if (userData.role == 2) {
            embed.setTitle(`${user.username}'s Profile`)
            embed.addFields(
                { name: 'Role', value: '🛠️ Developer' },
                { name: 'Balance', value: `$${balance}` },
            )
            embed.setColor('Aqua')
        } else if (userData.role == 0) {
            embed.setTitle(`${user.username}'s Profile`)
            embed.addFields(
                { name: 'Role', value: 'Default' },
                { name: 'Balance', value: `$${balance}` },
            )
            embed.setColor('Grey')
        }

        return interaction.reply({ embeds: [embed] })
    }
};
