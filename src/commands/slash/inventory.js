import { SlashCommandBuilder } from "@discordjs/builders";
import inventory from '../../utils/db/inventory.js'
import { EmbedBuilder } from "discord.js";
import skinsList from '../../utils/skins.json' assert { type: "json" }
import getItem from '../../utils/functions/getItem.js'
import getPrice from "../../utils/functions/getPrice.js";
import User from '../../utils/db/users.js'
import SteamMarketFetcher from 'steam-market-fetcher';

const market = new SteamMarketFetcher({
    currency: 'USD',
    format: 'json'
});

export default {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("Check out your Inventory"),
    run: async (client, interaction) => {
        await interaction.reply(`Calculating prices...`)
        const user = await interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        const listOfInventory = await checkInventory(interaction)
        const skins = []

        const errorEmbed = new EmbedBuilder().setTitle('Error').setColor('Red')

        if (listOfInventory == undefined) {
            errorEmbed.setDescription(`Couldn't find any skin in your inventory :(`)
            return interaction.editReply({ content: '', embeds: [errorEmbed] })
        }

        let i = 0
        let worth = 0
        for (i in listOfInventory) {
            if (!skins[Math.floor(i / 25)]) {
                if (userData.role == 0) {
                    await skins.push(new EmbedBuilder().setTitle(`${interaction.user.username}'s Inventory`).setDescription(`**Sell items with /sell [id]**\nID | PRICE | QUANTITY`).setColor(0x5897fc))
                } else if (userData.role == 1) {
                    await skins.push(new EmbedBuilder().setTitle(`💎 ${interaction.user.username}'s Inventory`).setDescription(`**Sell items with /sell [id]**\nID | PRICE | QUANTITY`).setColor(0x5897fc).setFooter({ text: 'Premium Account' }))
                } else if (userData.role == 2) {
                    await skins.push(new EmbedBuilder().setTitle(`🛠️ ${interaction.user.username}'s Inventory`).setDescription(`**Sell items with /sell [id]**\nID | PRICE | QUANTITY`).setColor(0x5897fc))
                }
            }
            if (skinsList['shop']['skins'][`${listOfInventory[i].skin.skin}`]) {
                let price = skinsList["shop"]['skins'][`${listOfInventory[i].skin.skin}`][0].price
                worth += price * listOfInventory[i].skin.quantity
                await skins[Math.floor(i / 25)].addFields({ name: `${listOfInventory[i].id} ($${price}) [${listOfInventory[i].skin.quantity}]`, value: `${listOfInventory[i].skin.skin}`, inline: true })
                i++
            } else {
                let itemInfo = await getItem(listOfInventory[i].skin.skin)
                let skinPrice = itemInfo.buff163.starting_at.price

                worth += parseFloat(skinPrice * listOfInventory[i].skin.quantity)
                await skins[Math.floor(i / 25)].addFields({ name: `${listOfInventory[i].id} ($${skinPrice.toFixed(2)}) [${listOfInventory[i].skin.quantity}]`, value: `${listOfInventory[i].skin.skin}`, inline: true })
                i++
            }
        }

        if (skins.length == 0) {
            errorEmbed.setDescription(`Couldn't find any skin in your inventory :(`)
            return interaction.editReply({ content: '', embeds: [errorEmbed] })
        }

        userData.totalInventoryValue = worth
        userData.save()

        return interaction.editReply({ content: `Total Value: **$${worth.toFixed(2)}**`, embeds: skins })
    }
};

async function checkInventory(interaction) {
    const dbData = await inventory.findOne({
        user_id: interaction.user.id
    })

    const inventoryList = []

    if (!dbData) {
        await inventory.create({
            user_id: interaction.user.id
        })
    } else {
        if (dbData.inventory == undefined) return inventoryList
        for (let i = 0; i < dbData.inventory.length; i++) {
            await inventoryList.push({
                id: i,
                skin: dbData.inventory[i]
            })
        }

        await dbData.save()
        return inventoryList
    }
}