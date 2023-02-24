
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const SpotifyWebApi = require('spotify-web-api-node');


const {Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents:  GatewayIntentBits.Guilds });
const spotifyApi = new SpotifyWebApi({
  clientId: "07d9efd73514400cb33768f1c81ab9e3",
  clientSecret: "0feb5d5ab0564e9aa91f900722dd7c7e",
});

client.on('ready', () => {
  console.log(`Salut ${client.user.tag}!`);
});

client.on('message', async (message) => {
  if (message.content.startsWith('!play ')) {
    const query = message.content.slice(6); // Récupère la partie de la commande après "!play "
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      message.reply(
        'Vous devez être connecté à un salon vocal pour utiliser cette commande.'
      );
      return;
    }

    // Authentification avec l'API Spotify
    try {
      const data = await spotifyApi.clientCredentialsGrant();
      const access_token = data.body.access_token;
      spotifyApi.setAccessToken(access_token);
    } catch (error) {
      console.error(error);
      message.reply('Une erreur est survenue lors de l\'authentification avec l\'API Spotify.');
      return;
    }

    // Recherche d'une piste Spotify correspondant à la requête de l'utilisateur
    try {
      const searchResults = await spotifyApi.searchTracks(query, { limit: 1 });
      const track = searchResults.body.tracks.items[0];
      if (!track) {
        message.reply('Aucune piste trouvée pour cette requête.');
        return;
      }

      // Téléchargement du fichier audio à partir de la piste Spotify
      const audioUrl = track.external_urls.spotify;
      const audioStream = ytdl(audioUrl, { filter: 'audioonly' });

      // Connexion au salon vocal et diffusion de la musique
      const connection = await voiceChannel.join();
      const dispatcher = connection.play(audioStream, { volume: 0.5 });

      dispatcher.on('finish', () => {
        connection.disconnect();
      });
    } catch (error) {
      console.error(error);
      message.reply('Une erreur est survenue lors de la recherche de la piste sur Spotify.');
    }
  }
});

client.login("MTA3ODY0MTA3MTI2Njk5NjI4NQ.GCsoVZ.nbfpTxzNd3edD6A8r8GXqoyVzQpGWvR3vdLlGM"); // Se connecte avec le token du bot Discord dans le fichier .env
