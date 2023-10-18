import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";
import prettyMilliseconds from "pretty-ms";

export default {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Get your daily reward"),
    run: async (client, interaction) => {
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        const embed = new EmbedBuilder().setColor('Yellow')
        let salary

        if (userData.role == 0) {
            salary = 50
        } else if (userData.role == 1) {
            salary = 500
        } else if (userData.role == 2) {
            salary = 31
        }

        if (userData.cooldowns.daily > Date.now()) return interaction.reply({
            embeds: [
                embed.setDescription(`⌛ You have already collected your money, wait for **${prettyMilliseconds(userData.cooldowns.daily - Date.now(), { verbose: true, secondsDecimalDigits: 0 })}**`)
            ],
            ephemeral: true
        })

        userData.balance += salary
        userData.cooldowns.daily = Date.now() + (1000 * 86400)
        userData.save()

        if (userData.role == 1) {
            const embed = new EmbedBuilder()
                .setFooter({ text: 'Premium Account' })
                .setColor('Gold')

            return interaction.reply({
                embeds: [ embed.setDescription(`💰 You have collected your daily **$${salary}** amount. Your balance is now at **$${userData.balance.toFixed(2)}**`) ]
            })
        } else {
            const embed = new EmbedBuilder()
                .setColor('Gold')

            return interaction.reply({
                embeds: [ embed.setDescription(`💰 You have collected your daily **$${salary}** amount. Your balance is now at **$${userData.balance.toFixed(2)}**`) ]
            })
        }

    }
};
