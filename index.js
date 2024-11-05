const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const { token, clientId, guildId, quotesChannelId } = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: [
                {
                    name: 'quote',
                    description: 'Quotes a message and posts it in the predefined quotes channel',
                    options: [
                        {
                            name: 'message',
                            type: ApplicationCommandOptionType.String, 
                            description: 'The message ID of the quote',
                            required: true
                        }
                    ]
                }
            ] }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'quote') {
        const messageId = interaction.options.getString('message');

        try {
            const message = await interaction.channel.messages.fetch(messageId);

            const embed = new EmbedBuilder()
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                .setDescription(message.content)
                .setFooter({ text: `Quoted by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp(message.createdAt)
                .setColor(0x00AE86);

            const quotesChannel = interaction.guild.channels.cache.get(quotesChannelId);
            
            if (!quotesChannel || !quotesChannel.isTextBased()) {
                return interaction.reply({ content: 'Quotes channel not found or not a text-based channel!', ephemeral: true });
            }

            await quotesChannel.send({ embeds: [embed] });

            await interaction.reply({ content: 'Message has been quoted!', ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Could not fetch the message. Make sure the ID is correct and that the message exists in this channel.', ephemeral: true });
        }
    }
});

client.login(token);
