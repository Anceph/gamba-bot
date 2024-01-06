import { InteractionType, EmbedBuilder } from "discord.js";

export default {
	name: 'interactionCreate',
	execute: async (interaction) => {
		let client = interaction.client;
		if (interaction.type == InteractionType.ApplicationCommand) {
			if (interaction.user.bot) return;
			if (!interaction.member) return interaction.reply({ content: `DMing is not allowed. Try my commands in a server!` })
			const command = client.slashcommands.get(interaction.commandName)
			try {
				await command.run(client, interaction);
			} catch (error) {
				const channel = client.channels.cache.get('1068159885918871554');
				const embed = new EmbedBuilder()
					.setTitle('Error')
					.setDescription(`Command: **${interaction.commandName}**\nError: ${error.message}\nStack: ${error.stack}`)
					.setColor('#FF0000')
					.setTimestamp();
				if (channel) {
					try {
						await channel.send({ embeds: [embed] });
					} catch (error) {
						console.error('Failed to send message:', error);
					}
				}
			}
		}
	}
}
