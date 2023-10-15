import 'dotenv/config'
import { Collection } from "discord.js";
import ms from "ms";
const cooldown = new Collection()

export default {
    name: 'messageCreate',
    execute: async (message) => {
        let client = message.client;
        let prefix = process.env.PREFIX

        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        if (cmd.length == 0) return;

        let command = client.commands.get(cmd)
        if (!command) command = client.commands.get(client.commandaliases.get(cmd));

        if (command) {
            if (command.cooldown) {
                if (cooldown.has(`${command.name}${message.author.id}`)) return message.reply({ content: `Please try again in \`${ms(cooldown.get(`${command.name}${message.author.id}`) - Date.now(), { long: true })}\`` }).then(msg => setTimeout(() => msg.delete(), cooldown.get(`${command.name}${message.author.id}`) - Date.now()))
                
                command.run(client, message, args)
                cooldown.set(`${command.name}${message.author.id}`, Date.now() + command.cooldown)
                
                setTimeout(() => {
                    cooldown.delete(`${command.name}${message.author.id}`)
                }, command.cooldown);
            } else {
                command.run(client, message, args)
            }
        }
    }
};
