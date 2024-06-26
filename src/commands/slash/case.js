import { SlashCommandBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import skinsData from '../../utils/skins.json' assert { type: "json" }
import inventory from '../../utils/db/inventory.js'
import User from '../../utils/db/users.js'
import prettyMilliseconds from "pretty-ms";
import getItem from '../../utils/functions/getItem.js'
import giveXp from "../../utils/functions/giveXp.js";

export default {
    data: new SlashCommandBuilder()
        .setName("case")
        .setDescription("Hobby time! GAMBA")
        .addStringOption(option =>
            option
                .setName('case')
                .setDescription('Select which case you wish to open')
                .setRequired(true)
                .addChoices(
                    { name: 'Chroma Case', value: 'chroma-case' },
                    { name: 'Revolution Case', value: 'revolution-case' },
                    { name: 'Operation Breakout Weapon Case', value: 'operation-breakout-weapon-case' },
                    { name: 'Operation Hydra Case', value: 'operation-hydra-case' },
                    { name: 'Dreams & Nightmares Case', value: 'dreams-and-nightmares-case' },
                    { name: 'Fracture Case', value: 'fracture-case' },
                    { name: 'Recoil Case', value: 'recoil-case' },
                    { name: 'Revolver Case', value: 'revolver-case' },
                )),
    run: async (client, interaction) => {
        const embeds = new EmbedBuilder()
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })

        if (userData.cooldowns.command && userData.cooldowns.command > Date.now()) {
            return interaction.reply({
                embeds: [
                    embeds.setDescription(`⌛ Hold on there! You have to wait **${prettyMilliseconds(userData.cooldowns.command - Date.now(), { verbose: true, secondsDecimalDigits: 0 })}** for more **GAMBA**`)
                ],
                ephemeral: true
            })
        }

        await interaction.deferReply()

        const caseName = interaction.options.getString('case')
        const { skins: Skins } = skinsData[caseName];
        const dbData = await inventory.findOne({
            user_id: interaction.user.id
        })

        let keyIcon
        if (!skinsData[caseName]['name'] == 'Operation Breakout Weapon Case') {
            keyIcon = skinsData.shop.skins[`${skinsData[caseName]['name']} Key`][0].icon
        } else {
            keyIcon = skinsData.shop.skins['Operation Breakout Case Key'][0].icon
        }

        userData.cooldowns.command = Date.now() + 3.5 * 1000
        await userData.save()

        const errorEmbed = new EmbedBuilder()
            .setTitle('Error')
            .setColor('Red')
            .setDescription(`You need a **${skinsData[caseName]['name']} Key** to open this case!`)
            .setThumbnail(`${keyIcon}`)

        const infoEmbed = new EmbedBuilder()
            .setTitle('Info')
            .setColor(0xf0b129)

        if (!dbData) {
            inventory.create({
                user_id: interaction.user.id
            })
            infoEmbed.setDescription(`You didn't have an inventory, so I created one! Try opening a case again.`)
            return interaction.reply({ embeds: [infoEmbed] })
        } else {
            if (dbData.inventory == null) return interaction.reply({ embeds: [errorEmbed] })
            let keyName
            if (skinsData[caseName]['name'] == 'Operation Breakout Weapon Case') {
                keyName = 'Operation Breakout Case Key'
            } else {
                keyName = `${skinsData[caseName]['name']} Key`
            }
            const foundKey = dbData.inventory.some((item) => item.skin === keyName)
            if (!foundKey) return interaction.editReply({ embeds: [errorEmbed] })
            await dbData.save()
        }

        const opening = new EmbedBuilder()
            .setTitle(`${skinsData[caseName].name}`)
            .setDescription(`Opening the case...`)
            .setThumbnail(`${skinsData[caseName].icon}`)

        await interaction.editReply({ embeds: [opening] })

        if (!dbData) {
            return inventory.create({
                user_id: interaction.user.id
            })
        } else {
            let keyName
            if (skinsData[caseName]['name'] == 'Operation Breakout Weapon Case') {
                keyName = 'Operation Breakout Case Key'
            } else {
                keyName = `${skinsData[caseName]['name']} Key`
            }

            const itemIndex = await dbData.inventory.findIndex((item) => item.skin === keyName);
            const item = dbData.inventory[itemIndex];
            const quantity = item.quantity;

            if (quantity == 1) {
                await dbData.inventory.splice(itemIndex, 1);
            } else {
                item.quantity -= 1;
            }

            await dbData.save();
        }

        await giveXp(user, userData, interaction.channelId, client)
        await userData.save()

        let probabilities = {
            "Mil-spec": 0.7992327,
            "Restricted": 0.1598465,
            "Classified": 0.0319693,
            "Covert": 0.0063939,
            "Special Item": 0.0025575
        };

        if (userData.devMode) {
            probabilities = {
                "Mil-spec": 0,
                "Restricted": 0,
                "Classified": 0,
                "Covert": 0,
                "Special Item": 100
            }
        }

        let obtainedSkin = getRandomSkin(Skins, probabilities)
        let finalSkin = `${obtainedSkin.skin} (${obtainedSkin.condition})`

        if (obtainedSkin.condition == "vanilla") {
            finalSkin = `${obtainedSkin.skin}`
        }

        let itemInfo = await getItem(finalSkin)
        let skinPrice = itemInfo.buff163.starting_at.price
        let skinIcon = obtainedSkin.icon

        const embed = new EmbedBuilder()
            .setTitle(`${skinsData[caseName].name}`)
            .setColor(obtainedSkin.rarity === 'Mil-spec' ? 0x4b69ff :
                obtainedSkin.rarity === 'Restricted' ? 0x8847ff :
                    obtainedSkin.rarity === 'Classified' ? 0x8847ff :
                        obtainedSkin.rarity === 'Covert' ? 0xeb4b4b :
                            obtainedSkin.rarity === 'Special Item' ? 0xffd700 : 'Black')
            .setFooter({ text: `Automatically sold if you don't select keep in 10 seconds` })
            .setDescription(`You got **${finalSkin}**\n Price: $${skinPrice}`)

        if (userData.devMode) embed.setFooter({ text: `Automatically sold if you don't select keep in 10 seconds\n\n⚙️ Testing Mode - Chances might be different than normal` })

        if (skinIcon) {
            embed.setThumbnail(`${skinIcon}`)
        } else {
            embed.setThumbnail(`https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/310px-Placeholder_view_vector.svg.png`)
        }

        const keep = new ButtonBuilder()
            .setCustomId('keep')
            .setLabel('Keep')
            .setStyle(ButtonStyle.Primary)

        const sell = new ButtonBuilder()
            .setCustomId('sell')
            .setLabel('Sell')
            .setStyle(ButtonStyle.Success)

        const row = new ActionRowBuilder()
            .addComponents(keep, sell)

        const setTimeoutPromise = (delay) => {
            return new Promise((resolve) => {
                setTimeout(resolve, delay);
            });
        };

        const collectorFilter = i => i.user.id === interaction.user.id;
        setTimeout(async () => {
            const response = await interaction.editReply({ embeds: [embed], components: [row] })

            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 12_000,
                });

                if (confirmation.customId === 'keep') {
                    if (!dbData) {
                        return inventory.create({
                            user_id: interaction.user.id
                        })
                    } else {
                        const existingItem = dbData.inventory.find((i) => i.skin === finalSkin);
                        if (existingItem) {
                            existingItem.quantity += 1
                        } else {
                            await dbData.inventory.push({ skin: finalSkin, quantity: 1, icon: skinIcon })
                        }
                        await dbData.save()
                        await confirmation.update({
                            content: `Kept`,
                            components: [],
                        });
                    }
                } else if (confirmation.customId === 'sell') {
                    let tempPrice = skinPrice
                    let fixedPrice = parseFloat(tempPrice)

                    userData.balance += fixedPrice
                    await userData.save()

                    await confirmation.update({ content: 'Sold', components: [] });
                }
            } catch (err) {
                let tempPrice = skinPrice
                let fixedPrice = parseFloat(tempPrice)

                userData.balance += fixedPrice
                await userData.save()
                await interaction.editReply({ content: 'Automatically sold', components: [] });
            }
        }, 1150)
    }
}

function getRandomSkin(caseName, probabilities) {
    let rand = Math.random();
    let cumulativeProb = 0;
    for (let rarity in probabilities) {
        cumulativeProb += probabilities[rarity];
        if (rand <= cumulativeProb) {
            let skinsInRarity = caseName[rarity];
            let randSkinIndex = Math.floor(Math.random() * skinsInRarity.length);
            let randSkin = skinsInRarity[randSkinIndex];
            let conditionsArray = Object.entries(randSkin.conditions);
            conditionsArray = shuffleArray(conditionsArray);
            let randCondition = conditionsArray[Math.floor(Math.random() * conditionsArray.length)];
            return {
                skin: randSkin.name,
                rarity: rarity,
                condition: randCondition[0],
                icon: randCondition[1]
            };
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}