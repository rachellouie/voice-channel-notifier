const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

// Create client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Store notification channel IDs per guild
const notificationChannels = new Map();

client.once('clientReady', () => {
    console.log(`${client.user.tag} has connected to Discord!`);
    console.log(`Bot is in ${client.guilds.cache.size} guild(s)`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member;
    const guild = newState.guild;
    
    // Get notification channel for this guild
    const channelId = notificationChannels.get(guild.id);
    if (!channelId) return;
    
    const notificationChannel = guild.channels.cache.get(channelId);
    if (!notificationChannel) return;
    
    // Someone joined a voice channel
    if (!oldState.channel && newState.channel) {
        const embed = new EmbedBuilder()
            .setTitle('🔊 Voice Channel Join')
            .setDescription(`${member} joined **${newState.channel.name}**`)
            .setColor(0x00FF00)
            .setThumbnail(member.displayAvatarURL())
            .setTimestamp();
        
        await notificationChannel.send({ embeds: [embed] });
    }
    // Someone left a voice channel
    else if (oldState.channel && !newState.channel) {
        const embed = new EmbedBuilder()
            .setTitle('🔇 Voice Channel Leave')
            .setDescription(`${member} left **${oldState.channel.name}**`)
            .setColor(0xFF0000)
            .setThumbnail(member.displayAvatarURL())
            .setTimestamp();
        
        await notificationChannel.send({ embeds: [embed] });
    }
    // Someone moved between voice channels
    else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        const embed = new EmbedBuilder()
            .setTitle('🔄 Voice Channel Move')
            .setDescription(`${member} moved from **${oldState.channel.name}** to **${newState.channel.name}**`)
            .setColor(0x0099FF)
            .setThumbnail(member.displayAvatarURL())
            .setTimestamp();
        
        await notificationChannel.send({ embeds: [embed] });
    }
});

client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Set notification channel command
    if (message.content === '!setchannel') {
        // Check if user has administrator permission
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need Administrator permission to use this command.');
        }
        
        notificationChannels.set(message.guild.id, message.channel.id);
        await message.reply(`✅ Notification channel set to ${message.channel}`);
    }
    
    // Test notification command
    if (message.content === '!testnotif') {
        const channelId = notificationChannels.get(message.guild.id);
        
        if (!channelId) {
            return message.reply('❌ No notification channel set. Use !setchannel first.');
        }
        
        const channel = message.guild.channels.cache.get(channelId);
        if (channel) {
            await channel.send('✅ Test notification - Bot is working!');
            await message.reply('Test notification sent!');
        } else {
            await message.reply('❌ Could not find notification channel.');
        }
    }
    
    // Help command
    if (message.content === '!help') {
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel Bot Commands')
            .setDescription('Monitor voice channel activity')
            .addFields(
                { name: '!setchannel', value: 'Set current channel for notifications (Admin only)' },
                { name: '!testnotif', value: 'Send a test notification' },
                { name: '!help', value: 'Show this help message' }
            )
            .setColor(0x0099FF);
        
        await message.reply({ embeds: [embed] });
    }
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN);