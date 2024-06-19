import { EmbedBuilder } from 'discord.js'
import ranksData from '../ranks.json' assert { type: "json" }
import getRankName from './getRankName.js'
import getRankReq from './getRankReq.js'
import { emojiList } from "../../../app.js";

export default async function giveXp(user, userData, channelId, client) {
    const currentRankName = await getRankName(userData.rank)

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

    userData.xp += 5
    await userData.save()
    if (userData.xp >= userData.nextRankReq) {
        userData.rank += 1
        userData.nextRankReq = await getRankReq(userData.rank)
        await userData.save()
        let newRankName = await getRankName(userData.rank)
        const embed = new EmbedBuilder()
            .setTitle(`Rank Up!`)
            .setColor('Green')
            .setThumbnail(user.displayAvatarURL())
            .setDescription(`Congratulations! You ranked up from **${enum_ranks[currentRankName]} ${currentRankName}** to **${enum_ranks[newRankName]} ${newRankName}**!`)

        client.channels.cache.get(channelId).send({ embeds: [embed] })
    }
}