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
                    { name: 'Chroma Case Key', value: 'Chroma Case Key' },
                    { name: 'Revolution Case Key', value: 'Revolution Case Key' },
                    { name: 'Operation Breakout Case Key', value: 'Operation Breakout Case Key' },
                    { name: 'Operation Hydra Case Key', value: 'Operation Hydra Case Key' },
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

        const dbData = await inventory.findOne({
            user_id: interaction.user.id
        })

        if (!dbData) {
            inventory.create({
                user_id: interaction.user.id
            })
        } else {
            const errorEmbed = new EmbedBuilder().setTitle('Error').setColor('Red')
            // const foundKey = dbData.inventory.some((item) => item.skin === keyName)

            skinsList['case-keys']['skins'].forEach(async i => {
                if (i.includes(`${idOfItem}`)) {
                    let skinPrice = skinsList['case-keys']['price']
                    if (userData.balance < skinPrice * quantityOfItem) {
                        errorEmbed.setDescription(`You need $${skinPrice * quantityOfItem} to buy this item`)
                        return interaction.reply({ embeds: [errorEmbed] })
                    } else {
                        let skinName = i
                        let skinIcon
                        if (skinName == 'Revolution Case Key') {
                            skinIcon = 'https://static.wikia.nocookie.net/cswikia/images/5/54/Csgo-revolution-key.PNG/revision/latest?cb=20230210063204'
                        } else if (skinName == 'Operation Breakout Weapon Case Key') {
                            skinIcon = 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXX7gNTPcUxuxpJSXPbQv2S1MDeXkh6LBBOie7rclA2hPCeIm8Rv9juzdjelPOkauuDxTtQ6pdzjOiTrI3w2AGxqBc_Y3ezetHBiL_RiA/360fx360f'
                        } else {
                            let itemInfo = await getItem(skinName)
                            skinIcon = `https://steamcommunity-a.akamaihd.net/economy/image/${itemInfo.icon_url}`
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

                        if (skinName == 'Revolution Case Key') {
                            embed.setThumbnail('https://static.wikia.nocookie.net/cswikia/images/5/54/Csgo-revolution-key.PNG/revision/latest?cb=20230210063204')
                        } else if (skinName == 'Operation Breakout Weapon Case Key') {
                            embed.setThumbnail('https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXX7gNTPcUxuxpJSXPbQv2S1MDeXkh6LBBOie7rclA2hPCeIm8Rv9juzdjelPOkauuDxTtQ6pdzjOiTrI3w2AGxqBc_Y3ezetHBiL_RiA/360fx360f')
                        } else {
                            embed.setThumbnail(`${skinIcon}`)
                        }

                        return interaction.reply({ embeds: [embed] })
                    }
                }
            });
        }
    }
};
