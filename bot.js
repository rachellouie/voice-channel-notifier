const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, Events } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Path to config file
const configPath = path.join(__dirname, 'config.json');

// Load or create config
let config = { notificationChannels: {} };
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('Loaded config from file');
  } catch (error) {
    console.error('Error loading config:', error);
  }
}

// Function to save config
function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Config saved');
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

// Create client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`${readyClient.user.tag} has connected to Discord!`);
  console.log(`Bot is in ${readyClient.guilds.cache.size} guild(s)`);
});

client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

client.on(Events.Warn, (info) => {
  console.warn('Discord client warning:', info);
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const member = newState.member;
  const guild = newState.guild;

  // Get notification channel for this guild
  const channelId = config.notificationChannels[guild.id];
  if (!channelId) return;

  const notificationChannel = guild.channels.cache.get(channelId);
  if (!notificationChannel) return;

  // Someone joined a voice channel
  if (!oldState.channel && newState.channel) {
    const embed = new EmbedBuilder()
      .setTitle('🔊 Voice Channel Join')
      .setDescription(`${member.displayName} joined "${newState.channel.name}"`)
      .setColor(0x00FF00)
      .setThumbnail(member.displayAvatarURL())
      .setTimestamp();

    await notificationChannel.send({
      content: `🔊 ${member.displayName} joined "${newState.channel.name}"`,
      embeds: [embed]
    });
  }
  // Someone left a voice channel
  else if (oldState.channel && !newState.channel) {
    const embed = new EmbedBuilder()
      .setTitle('🔇 Voice Channel Leave')
      .setDescription(`${member.displayName} left "${oldState.channel.name}"`)
      .setColor(0xFF0000)
      .setThumbnail(member.displayAvatarURL())
      .setTimestamp();

    await notificationChannel.send({
      content: `🔇 ${member.displayName} left "${oldState.channel.name}"`,
      embeds: [embed]
    });
  }
  // Someone moved between voice channels
  else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
    const embed = new EmbedBuilder()
      .setTitle('🔄 Voice Channel Move')
      .setDescription(`${member.displayName} moved from "${oldState.channel.name}" to "${newState.channel.name}"`)
      .setColor(0x0099FF)
      .setThumbnail(member.displayAvatarURL())
      .setTimestamp();

    await notificationChannel.send({
      content: `🔄 ${member.displayName} moved from "${oldState.channel.name}" to "${newState.channel.name}"`,
      embeds: [embed]
    });
  }
});

client.on(Events.MessageCreate, async (message) => {
  // Ignore bot messages and DMs
  if (message.author.bot || !message.guild) return;

  console.log(`Received message: "${message.content}" from ${message.author.tag} in ${message.guild.name}`);

  // Set notification channel command
  if (message.content === '!setchannel') {
    console.log('Processing !setchannel command');
    // Check if user has administrator permission
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      console.log('User lacks admin permission');
      return message.reply('❌ You need Administrator permission to use this command.');
    }

    config.notificationChannels[message.guild.id] = message.channel.id;
    saveConfig();
    console.log('Attempting to send reply...');
    try {
      await message.reply(`✅ Notification channel set to ${message.channel} and saved!`);
      console.log('Reply sent successfully');
    } catch (error) {
      console.error('Error sending reply:', error);
    }
    return;
  }

  // Test notification command
  if (message.content === '!testnotif') {
    const channelId = config.notificationChannels[message.guild.id];

    if (!channelId) {
      return message.reply('❌ No notification channel set. Use !setchannel first.');
    }

    const channel = message.guild.channels.cache.get(channelId);
    if (channel) {
      await channel.send('✅ Test notification - Bot is working!');
      return message.reply('Test notification sent!');
    } else {
      return message.reply('❌ Could not find notification channel.');
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

    return message.reply({ embeds: [embed] });
  }
});

// Health check server for Render.com
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Discord Voice Bot is running! 🤖');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    guilds: client.guilds.cache.size,
    wsStatus: client.ws.status
  });
});

app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});

// Login to Discord AFTER Express server starts
console.log('Attempting to login to Discord...');
console.log('Token exists:', !!process.env.DISCORD_BOT_TOKEN);
console.log('Token length:', process.env.DISCORD_BOT_TOKEN ? process.env.DISCORD_BOT_TOKEN.length : 0);

client.login(process.env.DISCORD_BOT_TOKEN)
  .then(() => console.log('Login successful'))
  .catch(error => {
    console.error('Failed to login to Discord:', error);
    process.exit(1);
  });
  