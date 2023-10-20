import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("pay")
        .setDescription("Send money to another user")
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you want to send money to')
                .setRequired(true))
        .addNumberOption(option =>
            option
                .setName('amount')
                .setDescription('Provide the amount you want to send')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        const targetUser = interaction.options.getUser('user')
        const tempAmount = interaction.options.getNumber('amount')
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        const targetUserData = await User.findOne({ id: targetUser.id }) || new User({ id: targetUser.id })

        const errorEmbed = new EmbedBuilder().setTitle('Error').setColor('Red')

        if (user == targetUser) {
            errorEmbed.setDescription(`You can't send yourself money.`)
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        } else if (targetUser == client.user) {
            errorEmbed.setDescription(`You can't send me money, sorry :(`)
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        }

        if (userData.balance < tempAmount) {
            errorEmbed.setDescription(`You don't have $${tempAmount} to send`)
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        }

        userData.balance -= tempAmount
        userData.save()
        targetUserData.balance += tempAmount
        targetUserData.save()

        const fixedAmount = tempAmount.toFixed(2)

        const embed = new EmbedBuilder()
            .setTitle(`Transaction`)
            .setColor('Yellow')
            .setThumbnail(targetUser.displayAvatarURL())

        if (userData.role == 1) {
            embed.setDescription(`Sent $${fixedAmount} to ${targetUser.username}`)
            embed.setFooter({ text: 'Premium Account' })
        } else if (userData.role == 2) {
            embed.setDescription(`Sent $${fixedAmount} to ${targetUser.username}`)
        } else if (userData.role == 0) {
            embed.setDescription(`Sent $${fixedAmount} to ${targetUser.username}`)
        }

        return interaction.reply({ embeds: [embed] })
    }
};
