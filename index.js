const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
    res.send('OK');
});

app.listen(port, () => {
    console.log(`Yellowyr web server listening on port ${port}`);
});

const hasDiscordToken = process.env.STATUS === 'BETA'
    ? Boolean(process.env.betatoken || process.env.BETA_TOKEN)
    : Boolean(process.env.TOKEN);

if (hasDiscordToken) {
    const { Sigma } = require('./src/structures/bot.js');
    const client = new Sigma();

    client.connect();
    module.exports = client;
} else {
    console.log('Discord bot login skipped because no token environment variable was provided.');
    module.exports = app;
}
