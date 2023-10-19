import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Shows leaderboard for your server")
        .addStringOption(option =>
            option
                .setName('choice')
                .setDescription('Sort it for balance or inventory value?')
                .setRequired(true)
                .addChoices(
                    { name: 'Sort for balance', value: 'balvalue' },
                    { name: 'Sort for inventory value', value: 'invvalue' },
                )),
    run: async (client, interaction) => {
        const tempChoice = interaction.options.getString('choice')
        const users = await interaction.guild.members.fetch()
        const fullList = []

        if (tempChoice == "balvalue") {
            users.forEach(async i => {
                await fullList.push({ id: i.user.id, username: i.user.username })
            });

            const listed = await Promise.all(fullList.map(async i => {
                const data = await User.findOne({ id: i.id }) || new User({ id: i.id });
                return { id: i.id, username: i.username, balance: Number(data.balance) };
            }));

            listed.sort((a, b) => b.balance - a.balance);

            const top10 = listed.slice(0, 10).map(user => ({ id: user.id, username: user.username, balance: user.balance }));

            const embed = new EmbedBuilder()
                .setTitle('Top 10 in Balance (This Server)')
                .setDescription(
                    `**🥇: ${top10[0].username}: $${top10[0].balance.toFixed(2)}**
                    **🥈: ${top10[1].username}**: $${top10[1].balance.toFixed(2)}
                    **🥉: ${top10[2].username}**: $${top10[2].balance.toFixed(2)}
                    4: ${top10[3].username}: $${top10[3].balance.toFixed(2)}
                    5: ${top10[4].username}: $${top10[4].balance.toFixed(2)}
                    6: ${top10[5].username}: $${top10[5].balance.toFixed(2)}
                    7: ${top10[6].username}: $${top10[6].balance.toFixed(2)}
                    8: ${top10[7].username}: $${top10[7].balance.toFixed(2)}
                    9: ${top10[8].username}: $${top10[8].balance.toFixed(2)}
                    10: ${top10[9].username}: $${top10[9].balance.toFixed(2)}`
                )

            return interaction.reply({ embeds: [embed] })
        } else if (tempChoice == "invvalue") {
            users.forEach(async i => {
                await fullList.push({ id: i.user.id, username: i.user.username })
            });

            const listed = await Promise.all(fullList.map(async i => {
                const data = await User.findOne({ id: i.id }) || new User({ id: i.id });
                return { id: i.id, username: i.username, value: Number(data.totalInventoryValue) };
            }));

            listed.sort((a, b) => b.value - a.value);

            const top10 = listed.slice(0, 10).map(user => ({ id: user.id, username: user.username, value: user.value }));

            const embed = new EmbedBuilder()
                .setTitle('Top 10 in Inventory Value (This Server)')
                .setDescription(
                    `**🥇: ${top10[0].username}: $${top10[0].value.toFixed(2)}**
                    **🥈: ${top10[1].username}**: $${top10[1].value.toFixed(2)}
                    **🥉: ${top10[2].username}**: $${top10[2].value.toFixed(2)}
                    4: ${top10[3].username}: $${top10[3].value.toFixed(2)}
                    5: ${top10[4].username}: $${top10[4].value.toFixed(2)}
                    6: ${top10[5].username}: $${top10[5].value.toFixed(2)}
                    7: ${top10[6].username}: $${top10[6].value.toFixed(2)}
                    8: ${top10[7].username}: $${top10[7].value.toFixed(2)}
                    9: ${top10[8].username}: $${top10[8].value.toFixed(2)}
                    10: ${top10[9].username}: $${top10[9].value.toFixed(2)}`
                )

            return interaction.reply({ embeds: [embed] })
        } else {
            return
        }
    }
};
