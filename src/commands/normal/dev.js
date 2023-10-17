import { EmbedBuilder } from 'discord.js';
import User from '../../utils/db/users.js'
import skinsData from '../../utils/skins.json' assert { type: "json" }
import inventory from '../../utils/db/inventory.js'
import axios from 'axios';
import getItem from '../../utils/functions/getItem.js'

const probabilities = {
    "Mil-spec": 0.7992327,
    "Restricted": 0.1598465,
    "Classified": 0.0319693,
    "Covert": 0.0063939,
    "Special_Item": 0.0025575
};

// const Fetcher = new SteamMarketFetcher({
//     currency: 'USD',
//     format: 'json'
// });

// const user = new SteamUser();
// const cdn = new CSGOCdn(user, {logLevel: 'debug'});

export default {
    name: "dev",
    aliases: [],
    cooldown: 0,
    run: async (client, message, args) => {
        if (message.author.id != 416826079563612181) return

        if (args[0] == "test2") {
            const item = args.slice(1).join(' ');
            console.log(item)

            let naber = await getItem(item)
            console.log(naber)
        }

        if (args[0] == "test") {
            const item = args.slice(1).join(' ');
            console.log(item)

            let url = 'https://csgobackpack.net/api/GetItemsList/v2/'
            const searchItem = item.replace("'", '&#39');
            axios.get(url)
                .then(response => {
                    const jsonData = response.data;

                    if (jsonData.items_list && jsonData.items_list[searchItem]) {
                        const itemInfo = jsonData.items_list[searchItem];

                        const desiredResponse = {
                            success: true,
                            currency: jsonData.currency,
                            timestamp: jsonData.timestamp,
                            items_list: {
                                [searchItem]: itemInfo
                            }
                        };

                        console.log(desiredResponse.items_list[`${searchItem}`])
                    } else {
                        console.error(`Item "${item}" not found in the response.`);
                        return null
                    }
                }).catch(err => { console.log(err) })

            // const result = await getItem(item)
            // console.log(result)
            // if (result.icon) {
            //     return console.log('var')
            // } else {
            //     return console.log('yok')
            // }

            // const price = await getItemPrice(item)
            // console.log(price)

            // const itemData = await getItem(item)
            // console.log(itemData)

            // const image = await getItemImage(item)
            // console.log(image)
        }

        if (args[0] == "help") {
            return message.reply(`deletecd (id)\n add (id) (quantity) (item (condition))\n give (id) (amount)\n take (id) (amount)`)
        }

        if (args[0] == "deletecd") {
            const data = await User.findOne({ id: args[1] })
            await data.updateOne({ $unset: { cooldowns: "" } })
            return message.reply(`Deleted users.${args[1]}.cooldowns.daily from the database`)
        }

        if (args[0] == "add") {
            const dbData = await inventory.findOne({
                user_id: args[1]
            })

            if (!dbData) {
                await inventory.create({
                    user_id: args[1]
                })
            } else {
                const item = args.slice(3).join(' ');
                const existingItem = dbData.inventory.find((i) => i.skin === item);

                if (existingItem) {
                    existingItem.quantity += parseInt(args[2])
                } else {
                    await dbData.inventory.push({ skin: item, quantity: args[2] })
                }

                await dbData.save()
                return message.reply(`Added ${item} to inventories.${args[1]}.inventory`)
            }
        }

        if (args[0] == "chroma-case") {
            const { skins: chromaCaseSkins } = skinsData['chroma-case'];
            let obtainedSkin = getRandomSkin(chromaCaseSkins);

            const embed = new EmbedBuilder()
                .setTitle(`Chroma Case`)
                .setColor(obtainedSkin.rarity === 'Mil-spec' ? 0x4b69ff :
                    obtainedSkin.rarity === 'Restricted' ? 0x8847ff :
                        obtainedSkin.rarity === 'Classified' ? 0x8847ff :
                            obtainedSkin.rarity === 'Covert' ? 0xeb4b4b :
                                obtainedSkin.rarity === 'Special_Item' ? 0xffd700 : 'Black')
                .setThumbnail('https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFEuh_KQJTtEuI63xIXbxqOtauyClTMEsJV1jruS89T3iQKx_BBqa2j3JpjVLFH1xpp0EQ/256fx256f')
                .setDescription(`You got **${obtainedSkin.skin}**!`)
                .setFooter({ text: 'dev mode - does not reperesent final product' })

            message.reply({ embeds: [embed] })
        }

        if (args[0] == "give") {
            const data = await User.findOne({ id: args[1] })
            const giveBalance = parseFloat(args[2])
            data.balance += giveBalance
            await data.save()
            return message.reply(`Added ${giveBalance} to users.${args[1]}.balance (Currently at ${data.balance})`)
        }

        if (args[0] == "take") {
            const data = await User.findOne({ id: args[1] })
            const giveBalance = parseFloat(args[2])
            data.balance -= giveBalance
            await data.save()
            return message.reply(`Removed ${giveBalance} from users.${args[1]}.balance (Currently at ${data.balance})`)
        }
    }
};

function getRandomSkin(caseName) {
    let rand = Math.random();
    let cumulativeProb = 0;
    for (let rarity in probabilities) {
        cumulativeProb += probabilities[rarity];
        if (rand <= cumulativeProb) {
            let skinsInRarity = caseName[rarity];
            let randSkinIndex = Math.floor(Math.random() * skinsInRarity.length);
            return {
                skin: skinsInRarity[randSkinIndex],
                rarity: rarity
            };
        }
    }
}
