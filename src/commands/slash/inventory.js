import { SlashCommandBuilder } from "@discordjs/builders";
import inventory from '../../utils/db/inventory.js'
import { EmbedBuilder } from "discord.js";
import skinsList from '../../utils/skins.json' assert { type: "json" }
import getItem from '../../utils/functions/getItem.js'

export default {
    data: new SlashCommandBuilder()
        .setName("inventory")
        .setDescription("Check out your Inventory"),
    run: async (client, interaction) => {
        await interaction.reply(`Calculating prices...`)
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
                await skins.push(new EmbedBuilder().setTitle(`${interaction.user.username}'s Inventory`).setDescription(`**Sell items with /sell [id]**\nID | PRICE | QUANTITY`).setColor(0x5897fc))
            }
            if (skinsList['case-keys'].skins.includes(`${listOfInventory[i].skin.skin}`)) {
                let price = skinsList["case-keys"].price
                worth += price * listOfInventory[i].skin.quantity
                await skins[Math.floor(i / 25)].addFields({ name: `${listOfInventory[i].id} ($${price}) [${listOfInventory[i].skin.quantity}]`, value: `${listOfInventory[i].skin.skin}`, inline: true })
                i++
            } else {
                let price = await getItem(listOfInventory[i].skin.skin)
                if (price.median_price == undefined) {
                    let average_price = price.average_price * listOfInventory[i].skin.quantity
                    worth += parseFloat(average_price)
                    await skins[Math.floor(i / 25)].addFields({ name: `${listOfInventory[i].id} ($${average_price.toFixed(2)}) [${listOfInventory[i].skin.quantity}]`, value: `${listOfInventory[i].skin.skin}`, inline: true })
                } else {
                    let median_price = price.median_price * listOfInventory[i].skin.quantity
                    worth += parseFloat(median_price)
                    await skins[Math.floor(i / 25)].addFields({ name: `${listOfInventory[i].id} ($${median_price.toFixed(2)}) [${listOfInventory[i].skin.quantity}]`, value: `${listOfInventory[i].skin.skin}`, inline: true })
                }
                i++
            }   
        }

        if (skins.length == 0) {
            errorEmbed.setDescription(`Couldn't find any skin in your inventory :(`)
            return interaction.editReply({ content: '', embeds: [errorEmbed] })
        }

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