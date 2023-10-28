import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";
import { emojiList } from "../../../app.js";
import getRankName from "../../utils/functions/getRankName.js";

export default {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Your profile"),
    run: async (client, interaction) => {
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        userData.save()

        const balance = userData.balance.toFixed(2)
        const rank = await getRankName(userData.rank)

        const enum_ranks = {
            "Silver I": emojiList['silver1'],
            "Silver II": emojiList['silver2'],
            "Silver III": emojiList['silver3'],
            "Silver IV": emojiList['silver4'],
            "Silver Elite": emojiList['silverelite'],
            "Silver Elite Master": emojiList['silverelitemaster'],
            "Gold Nova I": emojiList['goldnova1'],
            "Gold Nova II": emojiList['goldnova2'],
            "Gold Nova III": emojiList['goldnova3'],
            "Gold Nova Master": emojiList['goldnovamaster'],
            "Master Guardian I": emojiList['masterguardian1'],
            "Master Guardian II": emojiList['masterguardian2'],
            "Master Guardian Elite": emojiList['masterguardianelite'],
            "Distinguished Guardian Elite": emojiList['distinguishedguardianelite'],
            "Legendary Eagle": emojiList['legendaryeagle'],
            "Legendary Eagle Master": emojiList['legendaryeaglemaster'],
            "Supreme Master First Class": emojiList['suprememasterfirstclass'],
            "Global Elite": emojiList['globalelite'],
        };

        const embed = new EmbedBuilder()
            .setThumbnail(user.displayAvatarURL())

        if (userData.role == 1) {
            embed.setTitle(`${user.username}'s Profile`)
            embed.addFields(
                { name: 'Role', value: '💎 Premium' },
                { name: 'Rank', value: `${enum_ranks[rank]} ${rank}\n${userData.xp}/${userData.nextRankReq} XP` },
                { name: 'Balance', value: `$${balance}` },
            )
            embed.setColor('Gold')
        } else if (userData.role == 2) {
            embed.setTitle(`${user.username}'s Profile`)
            embed.addFields(
                { name: 'Role', value: '🛠️ Developer' },
                { name: 'Rank', value: `${enum_ranks[rank]} ${rank}\n${userData.xp}/${userData.nextRankReq} XP` },
                { name: 'Balance', value: `$${balance}` },
            )
            embed.setColor('Aqua')
        } else if (userData.role == 0) {
            embed.setTitle(`${user.username}'s Profile`)
            embed.addFields(
                { name: 'Role', value: 'Default' },
                { name: 'Rank', value: `${enum_ranks[rank]} ${rank}\n${userData.xp}/${userData.nextRankReq} XP` },
                { name: 'Balance', value: `$${balance}` },
            )
            embed.setColor('Grey')
        }

        return interaction.reply({ embeds: [embed] })
    }
};
