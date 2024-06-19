import { EmbedBuilder } from 'discord.js';
import User from '../../utils/db/users.js'
import skinsData from '../../utils/skins.json' assert { type: "json" }
import ranksData from '../../utils/ranks.json' assert { type: "json" }
import inventory from '../../utils/db/inventory.js'
import axios from 'axios';
import getItem from '../../utils/functions/getItem.js'
import Guild from '../../utils/db/guilds.js';
import 'dotenv/config'
import getRankReq from '../../utils/functions/getRankReq.js';
import SteamMarketFetcher from 'steam-market-fetcher';

const probabilities = {
    "Mil-spec": 0.7992327,
    "Restricted": 0.1598465,
    "Classified": 0.0319693,
    "Covert": 0.0063939,
    "Special_Item": 0.0025575
};

const market = new SteamMarketFetcher({
    currency: 'USD',
    format: 'json'
});

export default {
    name: "dev",
    aliases: [],
    cooldown: 0,
    run: async (client, message, args) => {
        if (message.author.id != process.env.OWNER_ID) return

        if (args[0] == "test2") {
            const item = args.slice(1).join(' ');
            console.log(item)

            let naber = await getItem(item)
            console.log(naber)
        }

        if (args[0] == "test") {
            // return console.log(User.db.collections.users)
            // User.forEach(async (user) => {
            //     user.xp += 5
            //     await user.save()
            // })
            // const data = await User.findOne({ id: args[1] })
            // return getRankReq(data.rank)
            // return message.reply(`Rank: ${data.rank} (${data.xp}/${data.nextRankReq} XP)`)
            // const data = await Guild.findOne({ id: message.guildId })
            // if (!data) {
            //     Guild.create({
            //         id: message.guildId
            //     })
            // }
            // if (!args[1]) return
            // const data = await User.findOne({ id: args[1] })
            // if (data.role == "0") return message.reply(`${args[1]}'s role: Default`)
            // if (data.role == "1") return message.reply(`${args[1]}'s role: Premium`)
            // if (data.role == "2") return message.reply(`${args[1]}'s role: Developer`)

            const item = args.slice(1).join(' ');
            console.log(item)

            // let url = "http://anceph.xyz/prices_v6.json"
            // axios.get(url)
            //     .then(function (response) {
            //         const jsonData = response.data;
            //         const itemData = jsonData["★ Sport Gloves | Pandora's Box (Factory New)"];
            //         console.log(itemData['buff163']);
            //     })
            //     .catch(function (error) {
            //         if (error.response) {
            //             console.error("Response data:", error.response.data);
            //             console.error("Status code:", error.response.status);
            //         } else if (error.request) {
            //             console.error("No response received");
            //         } else {
            //             console.error("Error setting up the request:", error.message);
            //         }
            //     });

            // let url = 'https://csgobackpack.net/api/GetItemsList/v2/'
            // const searchItem = item.replace("'", '&#39');
            // axios.get(url)
            //     .then(response => {
            //         const jsonData = response.data;

            //         if (jsonData.items_list && jsonData.items_list[searchItem]) {
            //             const itemInfo = jsonData.items_list[searchItem];

            //             const desiredResponse = {
            //                 success: true,
            //                 currency: jsonData.currency,
            //                 timestamp: jsonData.timestamp,
            //                 items_list: {
            //                     [searchItem]: itemInfo
            //                 }
            //             };

            //             console.log(desiredResponse.items_list[`${searchItem}`])
            //         } else {
            //             console.error(`Item "${item}" not found in the response.`);
            //             return null
            //         }
            //     }).catch(err => { console.log(err) })

            const result = await getItem(item)
            let icon = await market.getItemImage({
                market_hash_name: item,
                appid: 730
            })
            console.log(result, icon)
            console.log(result.buff163.starting_at.price)

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

        if (args[0] == "role") {
            if (args[2] != 0) {
                if (args[2] != 1) {
                    if (args[2] != 2) {
                        return
                    }
                }
            }
            const data = await User.findOne({ id: args[1] })
            await data.updateOne({ $set: { role: `${args[2]}` } })
            return message.reply(`Changed users.${args[1]}.role to ${args[2]}`)
        }

        if (args[0] == "rank") {
            const data = await User.findOne({ id: args[1] })
            let test = args[2] - 1
            let previousRank
            if (test < 0) {
                previousRank = await getRankReq(0)
            } else {
                previousRank = await getRankReq(test)
            }
            let rankReq = await getRankReq(args[2])
            data.nextRankReq = rankReq
            data.xp = previousRank
            await data.save()
            await data.updateOne({ $set: { rank: `${args[2]}` } })
            return message.reply(`Changed users.${args[1]}.rank to ${args[2]}`)
        }

        if (args[0] == "deletecd") {
            const data = await User.findOne({ id: args[1] })
            await data.updateOne({ $unset: { cooldowns: "" } })
            return message.reply(`Deleted users.${args[1]}.cooldowns.daily from the database`)
        }

        if (args[0] == "bj") {
            const data = await User.findOne({ id: args[1] })
            data.isPlayingBj = false
            await data.save()
            return message.reply(`Changed users.${args[1]}.isPlayingBj to false`)
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
                return message.reply(`Added ${args[2]} ${item} to inventories.${args[1]}.inventory`)
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
            if (args[1] == "xp") {
                const data = await User.findOne({ id: args[2] })
                data.xp += parseInt(args[3])
                await data.save()
                if (data.xp >= data.nextRankReq) {
                    data.rank += 1
                    data.nextRankReq = await getRankReq(data.rank)
                    await data.save()
                    return message.reply(`Added ${args[3]} to users.${args[2]}.xp (Currently at ${data.xp})`)
                } else {
                    await data.save()
                    return message.reply(`Added ${args[3]} to users.${args[2]}.xp (Currently at ${data.xp})`)
                }
            } else if (args[1] == "money") {
                const data = await User.findOne({ id: args[2] })
                const giveBalance = parseFloat(args[3])
                data.balance += giveBalance
                await data.save()
                return message.reply(`Added ${giveBalance} to users.${args[2]}.balance (Currently at ${data.balance})`)
            } else {
                return message.reply(`Error`)
            }
        }

        if (args[0] == "take") {
            if (args[1] == "xp") {
                const data = await User.findOne({ id: args[2] })
                data.xp -= parseInt(args[3])
                await data.save()
                return message.reply(`Removed ${args[3]} from users.${args[2]}.xp (Currently at ${data.xp})`)
            } else if (args[1] == "money") {
                const data = await User.findOne({ id: args[2] })
                const giveBalance = parseFloat(args[3])
                data.balance -= giveBalance
                await data.save()
                return message.reply(`Removed ${giveBalance} from users.${args[2]}.balance (Currently at ${data.balance})`)
            } else {
                return message.reply(`Error`)
            }
        }

        if (args[0] == "devmode") {
            const data = await User.findOne({ id: user.id })
            data.devMode = !data.devMode
            await data.save()
            return message.reply(`Changed users.${user.id}.devMode to ${data.devMode}`)
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
