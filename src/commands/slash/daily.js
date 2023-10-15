import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";
import prettyMilliseconds from "pretty-ms";

export default {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("test lol zaxd"),
    run: async (client, interaction) => {
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        const embed = new EmbedBuilder().setColor('Yellow')
        const salary = 50

        if (userData.cooldowns.daily > Date.now()) return interaction.reply({
            embeds: [
                embed.setDescription(`⌛ You have already collected your money, wait for **${prettyMilliseconds(userData.cooldowns.daily - Date.now(), { verbose: true, secondsDecimalDigits: 0 })}**`)
            ],
            ephemeral: true
        })

        userData.balance += salary
        userData.cooldowns.daily = Date.now() + (1000 * 86400)
        userData.save()

        return interaction.reply({
            embeds: [ embed.setDescription(`💰 You have collected your daily **$${salary}** amount. Your balance is now at **$${userData.balance}**`) ]
        })
    }
};
