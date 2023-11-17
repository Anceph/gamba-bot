import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";
import inventory from '../../utils/db/inventory.js'
import { SteamMarketParser, Currency } from 'steam-market-parser'
import skinsList from '../../utils/skins.json' assert { type: "json" }
import getItem from "../../utils/functions/getItem.js";

export default {
    data: new SlashCommandBuilder()
        .setName("buy")
        .setDescription("Buy skins with real Steam Market prices")
        .addStringOption(option =>
            option
                .setName('item')
                .setDescription('Select the item you want to buy')
                .setRequired(true)
                .addChoices(
                    { name: 'Chroma Case Key ($6)', value: 'Chroma Case Key' },
                    { name: 'Revolution Case Key ($4)', value: 'Revolution Case Key' },
                    { name: 'Operation Breakout Case Key ($10)', value: 'Operation Breakout Case Key' },
                    { name: 'Operation Hydra Case Key ($29.5)', value: 'Operation Hydra Case Key' },
                    { name: 'Dreams & Nightmares Case Key ($4.2)', value: 'Dreams & Nightmares Case Key' },
                    { name: 'Fracture Case Key ($3.5)', value: 'Fracture Case Key' },
                    { name: 'Recoil Case Key ($3.5)', value: 'Recoil Case Key' },
                    { name: 'Revolver Case Key ($5.5)', value: 'Revolver Case Key' },
                )
        )
        .addNumberOption(option =>
            option
                .setName('quantity')
                .setDescription('Provide the quantity of the item you want to buy')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        const idOfItem = interaction.options.getString('item')
        const quantityOfItem = interaction.options.getNumber('quantity')

        await interaction.reply('Checking prices...')

        const dbData = await inventory.findOne({
            user_id: interaction.user.id
        })

        if (!dbData) {
            inventory.create({
                user_id: interaction.user.id
            })
        } else {
            const errorEmbed = new EmbedBuilder().setTitle('Error').setColor('Red')

            let skinPrice = skinsList['shop']['skins'][`${idOfItem}`][0].price
            if (userData.balance < skinPrice * quantityOfItem) {
                errorEmbed.setDescription(`You need $${skinPrice * quantityOfItem} to buy this item`)
                return interaction.editReply({ content: '', embeds: [errorEmbed] })
            } else {
                let skinName = idOfItem
                let skinIcon

                let keyInfo = await getItem(skinName)
                if (keyInfo) {
                    skinIcon = `https://steamcommunity-a.akamaihd.net/economy/image/${keyInfo.icon_url}`
                } else {
                    let newSkinName = skinName.replace(/\sKey$/, '')
                    let newKeyInfo = await getItem(newSkinName)
                    skinIcon = `https://steamcommunity-a.akamaihd.net/economy/image/${newKeyInfo.icon_url}`
                }

                let existingItem
                for (let i = 0; i < quantityOfItem; i++) {
                    existingItem = dbData.inventory.find((i) => i.skin === skinName);
                    if (existingItem) {
                        existingItem.quantity += 1
                    } else {
                        await dbData.inventory.push({ skin: skinName, quantity: 1 })
                    }
                }
                await dbData.save()
                userData.balance -= skinPrice * quantityOfItem
                await userData.save()

                const embed = new EmbedBuilder()
                    .setTitle('Market')
                    .setDescription(`You just bought **${quantityOfItem}** **${skinName}** for **$${skinPrice * quantityOfItem}**`)
                    .setColor('Green')
                    .setThumbnail(`${skinIcon}`)

                return interaction.editReply({ content: '', embeds: [embed] })
            }
        }
    }
};
