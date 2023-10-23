import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { emojiList } from "../../../app.js";
import Blackjack from "simply-blackjack";

export default {
    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription('Play a game of blackjack')
        .addStringOption((option) =>
            option
                .setName('bet')
                .setDescription(
                    'The amount you want to bet'
                )
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        await interaction.deferReply().catch(() => { });
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })

        const playerBalance = userData.balance.toFixed(2)
        const errorEmbed = new EmbedBuilder().setTitle('Error').setColor('Red')

        if (userData.isPlayingBj && userData.isPlayingBj == true) {
            errorEmbed.setDescription(`You already have a active game of blackjack running. Finish that first.`)
            return interaction.editReply({ embeds: [errorEmbed] })
        }

        userData.isPlayingBj = true
        await userData.save()

        try {
            const tempBet = interaction.options.getString('bet');

            if (userData.balance >= tempBet) {
                userData.balance -= tempBet
                await userData.save()

                const Game = new Blackjack({
                    decks: 2,
                    payouts: {
                        blackjack: 3,
                        default: 2,
                    },
                });
                Game.bet(tempBet);
                Game.start();

                const enum_cards = {
                    A: emojiList['A_'],
                    2: emojiList['2_'],
                    3: emojiList['3_'],
                    4: emojiList['4_'],
                    5: emojiList['5_'],
                    6: emojiList['6_'],
                    7: emojiList['7_'],
                    8: emojiList['8_'],
                    9: emojiList['9_'],
                    10: emojiList['10'],
                    J: emojiList['J_'],
                    Q: emojiList['Q_'],
                    K: emojiList['K_'],
                    hidden: emojiList['hidden'],
                };

                var player_cards = [];
                var dealer_cards = [];

                Game.player.forEach((element) => {
                    player_cards.push(enum_cards[element.name.substr(0, 2).trim()]);
                });

                Game.table.dealer.cards.forEach((element) => {
                    dealer_cards.push(enum_cards[element.name.substr(0, 2).trim()]);
                });
                dealer_cards.push(enum_cards['hidden']);

                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .addFields(
                        {
                            name: 'Blackjack',
                            value: `💰 Bet: ${tempBet}\n💥 Hit: take another card\n🛑 Stand: ends the game\n💸 Double: double the bet, hit once, then stand`,
                            inline: false,
                        },
                        {
                            name: `Your hand\n${player_cards.join(' ')}`,
                            value: `**Value: ${Game.table.player.total}**`,
                            inline: true,
                        },
                        {
                            name: `Dealer's hand\n${dealer_cards.join(' ')}`,
                            value: `**Value: ${Game.table.dealer.total}**`,
                            inline: true,
                        }
                    )

                const hit = new ButtonBuilder()
                    .setCustomId('hit')
                    .setLabel("Hit")
                    .setStyle(ButtonStyle.Secondary)

                const stand = new ButtonBuilder()
                    .setCustomId('stand')
                    .setLabel("Stand")
                    .setStyle(ButtonStyle.Secondary)

                const double = new ButtonBuilder()
                    .setCustomId('double')
                    .setLabel("Double Down")
                    .setStyle(ButtonStyle.Secondary)

                const row = new ActionRowBuilder()
                    .addComponents(hit, stand, double)

                var answer = await interaction.editReply({
                    embeds: [embed],
                    components: [row],
                    fetchReply: true,
                });

                const collectorFilter = i => i.user.id === interaction.user.id;

                const collector = answer.createMessageComponentCollector({
                    filter: collectorFilter,
                    time: 1000 * 60 * 30,
                });

                Game.on('end', async (results) => {
                    collector.stop();

                    var player_cards = [];
                    var dealer_cards = [];

                    results.player.cards.forEach((element) => {
                        player_cards.push(enum_cards[element.name.substr(0, 2).trim()]);
                    });

                    results.dealer.cards.forEach((element) => {
                        dealer_cards.push(enum_cards[element.name.substr(0, 2).trim()]);
                    });

                    embed.data.fields[1] = {
                        name: `Your hand\n${player_cards.join(' ')}`,
                        value: `**Value: ${results.player.total}**`,
                        inline: true,
                    };
                    embed.data.fields[2] = {
                        name: `Dealer's hand\n${dealer_cards.join(' ')}`,
                        value: `**Value: ${results.dealer.total}**`,
                        inline: true,
                    };

                    if (results.state === 'draw') {
                        embed.data.fields[0].value = `Draw, you received back $${results.bet}`
                        embed.setColor(9807270);
                        userData.balance += results.bet
                        userData.isPlayingBj = false
                        await userData.save()
                    } else if (results.state === 'player_blackjack') {
                        embed.data.fields[0].value = `Blackjack! you won $${results.winnings}`
                        embed.setColor(15844367);
                        userData.balance += results.bet + results.winnings
                        userData.isPlayingBj = false
                        await userData.save()
                    } else if (results.state === 'player_win') {
                        if (results.dealer.total > 21) {
                            embed.data.fields[0].value = `Dealer bust! you won $${results.winnings}`
                        } else {
                            embed.data.fields[0].value = `You won $${results.winnings}`
                        }
                        embed.setColor(3066993);
                        userData.balance += results.winnings
                        userData.isPlayingBj = false
                        await userData.save()
                    } else if (results.state === 'dealer_win') {
                        if (results.player.total > 21) {
                            embed.data.fields[0].value = `You busted! You lost $${results.losses}`
                        } else {
                            embed.data.fields[0].value = `You lost $${results.losses}`
                        }
                        embed.setColor(15158332);
                        userData.isPlayingBj = false
                        await userData.save()
                    } else {
                        embed.data.fields[0].value = `Dealer blackjack! You lost $${results.losses}`
                        embed.setColor(10038562);
                        userData.isPlayingBj = false
                        await userData.save()
                    }

                    await interaction.editReply({
                        embeds: [embed],
                        components: [row],
                    });
                });

                if (Game.table.player.total >= 21) {
                    Game.stand();
                }

                collector.on('collect', async (i) => {
                    if (i.customId === 'hit') {
                        Game.hit();

                        double.setDisabled(true);

                        if (Game.table.player.total >= 21) {
                            Game.stand();
                            i.deferUpdate();
                        } else {
                            var player_cards = [];
                            var dealer_cards = [];

                            Game.player.forEach((element) => {
                                player_cards.push(enum_cards[element.name.substr(0, 2).trim()]);
                            });

                            Game.table.dealer.cards.forEach((element) => {
                                dealer_cards.push(enum_cards[element.name.substr(0, 2).trim()]);
                            });
                            dealer_cards.push(enum_cards['hidden']);

                            embed.data.fields[1] = {
                                name: `Your hand\n${player_cards.join(' ')}`,
                                value: `**Value: ${Game.table.player.total}**`,
                                inline: true,
                            };
                            embed.data.fields[2] = {
                                name: `Dealer's hand\n${dealer_cards.join(' ')}`,
                                value: `**Value: ${Game.table.dealer.total}**`,
                                inline: true,
                            };

                            await i.update({
                                embeds: [embed],
                                components: [row],
                            });
                        }
                    } else if (i.customId === 'stand') {
                        Game.stand();
                        i.deferUpdate();
                    } else {
                        if (userData.balance >= tempBet) {
                            userData.balance -= tempBet
                            await userData.save()
                            Game.bet(tempBet * 2);
                            Game.hit();
                            Game.stand();
                            i.deferUpdate()
                        } else {
                            errorEmbed.setDescription(`You don't have $${tempBet} in your account`)
                            i.reply({
                                embeds: [errorEmbed],
                                ephemeral: true,
                            });
                        }
                    }
                });

                collector.on('end', () => {
                    if (collector.endReason === 'time') {
                        Game.stand();
                    }
                });
            } else {
                errorEmbed.setDescription(`You don't have $${tempBet} in your account`)
                await interaction.editReply({ embeds: [errorEmbed] });
            }
        } catch (error) {
            console.error(`Blackjack: ${error}`);
            interaction.editReply({
                content: "An error occurred while running the command. Please try again.",
                embeds: [],
                components: [],
            });
        }
    }
};
