import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";
import inventory from '../../utils/db/inventory.js'
import { SteamMarketParser, Currency } from 'steam-market-parser'
import skinsList from '../../utils/skins.json' assert { type: "json" }
import getItem from "../../utils/functions/getItem.js";
import getPrice from "../../utils/functions/getPrice.js";

export default {
    data: new SlashCommandBuilder()
        .setName("sell")
        .setDescription("Sell your skins with real Steam Market prices")
        .addNumberOption(option =>
            option
                .setName('id')
                .setDescription('Provide the ID of the item you want to sell')
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName('quantity')
                .setDescription('Provide the quantity you want to sell.')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        const idOfItem = interaction.options.getNumber('id')
        const errorEmbed = new EmbedBuilder().setTitle('Error').setColor('Red')
        const quantityToSell = interaction.options.getNumber('quantity')

        if (quantityToSell == 0) {
            errorEmbed.setDescription(`You can't sell less than 1 item`)
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        }

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
                errorEmbed.setDescription(`Sorry, but you can't sell your case keys.`)
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
            }

            let skinName = dbData.inventory[idOfItem].skin
            let quantity = dbData.inventory[idOfItem].quantity
            let itemInfo = await getItem(`${dbData.inventory[idOfItem].skin}`)
            let skinPrice = itemInfo.buff163.starting_at.price
            let skinIcon = await market.getItemImage({
                market_hash_name: skinName,
                appid: 730
            })

            if (quantityToSell > quantity) {
                errorEmbed.setDescription(`You do not have **${quantityToSell}** of ${skinName}`)
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
            }

            if (quantityToSell == 1 && quantity == 1) {
                dbData.inventory = dbData.inventory.filter((item, index) => index !== idOfItem);
            } else {
                dbData.inventory[idOfItem].quantity -= quantityToSell;
            }

            await dbData.save()

            if (skinName.endsWith("Key")) {
                let price = 2.5 * quantityToSell

                userData.balance += price
                await userData.save()

                const embed = new EmbedBuilder()
                    .setTitle('Market')
                    .setDescription(`You just sold your **${quantityToSell} ${skinName}** for **$${price}**`)
                    .setThumbnail(`${skinIcon}`)
                    .setColor('Green')

                return interaction.reply({ embeds: [embed] })
            } else {
                let tempPrice = skinPrice * quantityToSell
                let fixedPrice = parseFloat(tempPrice)
                let price = fixedPrice.toFixed(2)

                userData.balance += fixedPrice
                await userData.save()

                const embed = new EmbedBuilder()
                    .setTitle('Market')
                    .setDescription(`You just sold your **${quantityToSell} ${skinName}** for **$${price}**`)
                    .setThumbnail(`${skinIcon}`)
                    .setColor('Green')

                return interaction.reply({ embeds: [embed] })
            }
        }
    }
};
