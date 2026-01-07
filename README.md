# Discord Voice Channel Notifier Bot

A Discord bot that monitors voice channel activity and sends notifications when users join, leave, or move between voice channels.

## Features

- Real-time notifications when users join voice channels
- Notifications when users leave voice channels
- Notifications when users move between voice channels
- Clean, readable push notifications with user display names
- Customizable notification channel per server
- Rich embed messages with user avatars and timestamps

## Commands

- `!setchannel` - Set the current text channel as the notification channel (requires Administrator permission)
- `!testnotif` - Send a test notification to verify the bot is working
- `!help` - Display available commands

## Tech Stack

- **Node.js** - Runtime environment
- **discord.js** - Discord API library
- **Express** - Web server for health checks
- **Render.com** - Free hosting platform (Web Service)
- **UptimeRobot** - Free uptime monitoring to keep the bot alive

## Setup Instructions

### 1. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to the "Bot" tab and click "Add Bot"
4. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent
5. Copy your bot token (keep it secret!)

### 2. Invite Bot to Server

1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`
3. Select bot permissions:
   - Send Messages
   - Embed Links
   - Read Message History
4. Copy and open the generated URL to invite the bot to your server

### 3. Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd discord-voice-bot

# Install dependencies
npm install

# Create .env file
echo "DISCORD_BOT_TOKEN=your_token_here" > .env

# Run the bot
npm start
```

### 4. Deploy to Render.com

1. Push your code to GitHub (make sure `.env` is in `.gitignore`)
2. Sign up at [render.com](https://render.com) using your GitHub account
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure the service:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variable:
   - Key: `DISCORD_BOT_TOKEN`
   - Value: Your Discord bot token
7. Click "Create Web Service"

**Why Web Service?** 
- Render's Background Workers are not free
- We use a Web Service with an Express health endpoint to satisfy Render's port requirements
- The Express server runs alongside the Discord bot

### 5. Keep the Bot Alive with UptimeRobot

Render's free tier spins down services after 15 minutes of inactivity. To prevent this:

1. Go to [uptimerobot.com](https://uptimerobot.com) and create a free account
2. Click "Add New Monitor"
3. Configure the monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Discord Voice Bot
   - **URL**: `https://your-bot-name.onrender.com/health`
   - **Monitoring Interval**: 5 minutes
4. Save the monitor

UptimeRobot will ping your bot every 5 minutes, keeping it awake 24/7.

## Usage

1. In your Discord server, go to the text channel where you want notifications
2. Run `!setchannel` (you need Administrator permission)
3. The bot will now send notifications to this channel when users join/leave voice channels

**Example notifications:**
- 🔊 Username joined "General"
- 🔇 Username left "Music"
- 🔄 Username moved from "General" to "Music"

## Important Notes

### Notification Channel Persistence

⚠️ **The notification channel setting needs to be reconfigured after:**
- Server restarts (rare)
- New code deployments
- Bot crashes

This is because Render's free tier uses **ephemeral storage** - the `config.json` file that stores settings is lost when the service redeploys. After any deployment, simply run `!setchannel` again in your desired notification channel.

**Workaround:** Settings persist through normal restarts, just not through redeployments. If you need permanent persistence, consider using environment variables or upgrading to a paid Render plan.

## Project Structure

```
discord-voice-bot/
├── bot.js              # Main bot code
├── config.json         # Notification channel settings (auto-generated)
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (local only)
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## Dependencies

```json
{
  "discord.js": "^14.14.1",
  "dotenv": "^16.3.1",
  "express": "^4.18.2"
}
```

## Troubleshooting

**Bot not responding to commands:**
- Check that the bot has proper permissions in your server
- Verify the bot token is correctly set in Render environment variables
- Check Render logs for errors

**Notifications not appearing:**
- Run `!setchannel` to set/reset the notification channel
- Use `!testnotif` to verify the bot can send messages
- Ensure the bot has "Send Messages" and "Embed Links" permissions

**Bot going offline:**
- Verify UptimeRobot is actively monitoring your health endpoint
- Check Render logs for any errors
- Ensure your Render service shows "Live" status

## License

MIT
