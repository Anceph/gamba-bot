import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Coinflip your live savings away")
        .addStringOption(option =>
            option
                .setName('coin')
                .setDescription('Select your coin, bet and flip that coin!')
                .setRequired(true)
                .addChoices(
                    { name: 'T Coin', value: 't-coin' },
                    { name: 'CT Coin', value: 'ct-coin' },
                ))
        .addNumberOption(option =>
            option
                .setName('bet')
                .setDescription('Provide the amount you want to bet')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        const tempChoice = interaction.options.getString('coin')
        const tempBet = interaction.options.getNumber('bet')
        const user = interaction.member.user
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        userData.save()

        const errorEmbed = new EmbedBuilder().setTitle('Error').setColor('Red')

        if (userData.balance < tempBet) {
            errorEmbed.setDescription(`You don't have $${tempBet} in your account`)
            return interaction.reply({ embeds: [errorEmbed] })
        }

        let coinChoice

        if (tempChoice == "t-coin") {
            coinChoice = "T Coin"
        } else {
            coinChoice = "CT Coin"
        }

        const embed = new EmbedBuilder()
            .setTitle(`Coin Flip`)
            .setDescription(`Flipping...`)
            .setColor('Yellow')
            .setImage('https://i.imgur.com/qIPAaY2.gif')

        await interaction.reply({ embeds: [embed] })

        let result
        result = await flipCoin()

        userData.balance -= tempBet
        await userData.save()
        let winPrice = tempBet * 2

        setTimeout(async () => {
            const embed2 = new EmbedBuilder()
                .setTitle(`Coin Flip`)

            if (result == "t" && tempChoice == "t-coin") {
                embed2.setDescription(`You chose **${coinChoice}** and you won **${winPrice}!**`)
                embed2.setColor('Yellow')
                embed2.setImage('https://raw.githubusercontent.com/Anceph/Ancephxyz/main/t.png')

                userData.balance += winPrice
                await userData.save()
                return interaction.editReply({ embeds: [embed2] })
            } else if (result == "t" && tempChoice == "ct-coin") {
                embed2.setDescription(`You chose **${coinChoice}** and you lost your **${tempBet}**`)
                embed2.setColor('Yellow')
                embed2.setImage('https://raw.githubusercontent.com/Anceph/Ancephxyz/main/t.png')

                await userData.save()
                return interaction.editReply({ embeds: [embed2] })
            } else if (result == "ct" && tempChoice == "ct-coin") {
                embed2.setDescription(`You chose **${coinChoice}** and you won **${winPrice}!**`)
                embed2.setColor('Blue')
                embed2.setImage('https://raw.githubusercontent.com/Anceph/Ancephxyz/main/ct.png')

                userData.balance += winPrice
                await userData.save()
                return interaction.editReply({ embeds: [embed2] })
            } else if (result == "ct" && tempChoice == "t-coin") {
                embed2.setDescription(`You chose **${coinChoice}** and you lost your **${tempBet}**`)
                embed2.setColor('Blue')
                embed2.setImage('https://raw.githubusercontent.com/Anceph/Ancephxyz/main/ct.png')

                await userData.save()
                return interaction.editReply({ embeds: [embed2] })
            }

        }, 4000);
    }
};

function flipCoin() {
    const random = Math.random();
    if (random < 0.5) {
        return 't';
    } else {
        return 'ct';
    }
}