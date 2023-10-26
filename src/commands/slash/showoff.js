import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";
import inventory from '../../utils/db/inventory.js'
import skinsList from '../../utils/skins.json' assert { type: "json" }
import getItem from "../../utils/functions/getItem.js";
import getPrice from "../../utils/functions/getPrice.js";

export default {
    data: new SlashCommandBuilder()
        .setName("showoff")
        .setDescription("Show off your skin!")
        .addNumberOption(option =>
            option
                .setName('id')
                .setDescription('Provide the ID of the item you want to show off')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        const idOfItem = interaction.options.getNumber('id')
        const errorEmbed = new EmbedBuilder().setTitle('Error').setColor('Red')
        await userData.save()

        const dbData = await inventory.findOne({
            user_id: interaction.user.id
        })

        if (!dbData) {
            return inventory.create({
                user_id: interaction.user.id
            })
        } else {
            const inventoryItem = dbData.inventory[idOfItem]
            if (!inventoryItem) {
                errorEmbed.setDescription(`Couldn't find any skins in your inventory with the given ID.`)
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
            }
            if (skinsList['shop']['skins'] != undefined && skinsList["shop"]['skins'][`${inventoryItem.skin}`]) {
                errorEmbed.setDescription(`Sorry, but you can't show off your case keys :)))))))`)
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
            }

            let skinName = dbData.inventory[idOfItem].skin
            let itemInfo = await getItem(`${dbData.inventory[idOfItem].skin}`)
            let skinPrice
            if (itemInfo.price && itemInfo.price['7_days'] && itemInfo.price['7_days'].average != 0 && itemInfo.price['7_days'].median != 0) {
                skinPrice = itemInfo.price['7_days']
            } else {
                let tempPrice1 = await getPrice(skinName)
                skinPrice = tempPrice1.price
            }
            let skinIcon = `https://steamcommunity-a.akamaihd.net/economy/image/${itemInfo.icon_url}`

            const embed = new EmbedBuilder()
                .setTitle(`${skinName}`)
                .setThumbnail(user.displayAvatarURL())
                .setImage(skinIcon)
                .setColor('#a442f5')

            if (userData.role == 1) {
                embed.setFooter({ text: 'Premium Account' })
            }

            if (skinPrice.median == undefined && skinPrice.average) {
                embed.setDescription(`Price: **$${skinPrice.average}**`)
            } else if (skinPrice.median) {
                embed.setDescription(`Price: **$${skinPrice.median}**`)
            } else {
                embed.setDescription(`Price: **$${skinPrice}**`)
            }

            return interaction.reply({ embeds: [embed] })
        }
    }
};
