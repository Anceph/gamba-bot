import { SlashCommandBuilder } from "@discordjs/builders";
import User from '../../utils/db/users.js'
import { EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("jackpot")
        .setDescription("Throw in your skin for the jackpot")
        .addNumberOption(option =>
            option
                .setName('id')
                .setDescription('ID of the skin you want to throw in the jackpot')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        return interaction.reply({ text: 'daha yok baybay', ephemeral: true })

        // TODO: BURAYI KOMPLE YAP
        // TODO: BURAYI KOMPLE YAP
        // TODO: BURAYI KOMPLE YAP

        const user = interaction.member.user
        const errorEmbed = new EmbedBuilder().setTitle('Error').setColor('Red')
        const userData = await User.findOne({ id: user.id }) || new User({ id: user.id })
        const tempID = interaction.options.getNumber('id')
        userData.save()

        const balance = userData.balance.toFixed(2)


        const dbData = await inventory.findOne({
            user_id: interaction.user.id
        })
        if (!dbData) {
            inventory.create({
                user_id: interaction.user.id
            })
        } else {
            const inventoryItem = dbData.inventory[tempID]
            if (!inventoryItem) {
                errorEmbed.setDescription(`Couldn't find any skins in your inventory with the given ID.`)
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true })
            }
        }
    }
};
