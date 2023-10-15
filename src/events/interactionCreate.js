import { InteractionType } from "discord.js";

export default {
	name: 'interactionCreate',
	execute: async (interaction) => {
		let client = interaction.client;
		if (interaction.type == InteractionType.ApplicationCommand) {
			if (interaction.user.bot) return;
			try {
				const command = client.slashcommands.get(interaction.commandName)
				command.run(client, interaction)
			} catch {
				interaction.reply({ content: "An error occurred while running the command. Please try again.", ephemeral: true })
			}
		}
	}
}
