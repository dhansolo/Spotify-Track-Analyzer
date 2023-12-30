const config = require("./config/config")
const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const SpotifyHelper = require("./helpers/spotify_helper");
const { access } = require("fs");

const app = express();
const port = 3000;


async function getAccessToken(code) {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const credentials = `${config.client_id}:${config.client_secret}`;
    const basicAuthHeader = Buffer.from(credentials).toString('base64');

    const data = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirect_uri,
        scope: config.scopes // Include the scopes here
    };

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuthHeader}`
    };

    const response = await axios.post(tokenUrl, querystring.stringify(data), { headers });
    return response.data.access_token;
} 

// Endpoint to initiate Spotify authentication
app.get('/login', (req, res) => {
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${config.client_id}&redirect_uri=${config.redirect_uri}&scope=${encodeURIComponent(config.scopes)}&response_type=code&show_dialog=true`);
});
  
// Callback endpoint to handle Spotify's redirect after authentication
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const accessToken = await getAccessToken(code);
    track_analyzer(accessToken);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log("\n");
});

async function track_analyzer(accessToken) {
    let seed_tracks = [];
    let seed_artists = [];

    let tracks_ids = []

    let danceability_count = 0;
    let energy_count = 0;
    let positivity_count = 0;
    let duration_count = 0;

    let avg_danceability = 0;
    let avg_energy = 0;
    let avg_positivity = 0;

    try {
        let tracks = await SpotifyHelper.get_top_tracks(accessToken);

        for(let track of tracks.data.items) {
            console.log(`${track.name} - ${track.artists[0].name} - ${track.album.name}`)
            tracks_ids.push(track.id);
            if(seed_tracks.length < 5) {
                seed_tracks.push(track.id);
            }
            if(seed_artists.length < 5) {
                seed_artists.push(track.artistId)
            }
        }
    } catch(err) {
        console.log(err.response);
    }

    try {
        let tracks_details = await SpotifyHelper.get_tracks_details(accessToken, tracks_ids);
        for(let track of tracks_details.data.audio_features) {
            danceability_count += track.danceability;
            energy_count += track.energy;
            positivity_count += track.valence;
            duration_count += track.duration_ms;
        }
        avg_danceability = (danceability_count/50);
        avg_energy = (energy_count/50);
        avg_positivity = (positivity_count/50);

        console.log("\n");
        console.log("Your results");
        console.log("Danceability: " + (avg_danceability * 100).toFixed(2) + "%");
        console.log("Energy: " + (avg_energy * 100).toFixed(2) + "%");
        console.log("Positivity: " + (avg_positivity * 100).toFixed(2) + "%")
        console.log("\n");

    } catch(err) {
        console.log(err.response);
    }

    let recs;
    try {
        recs = await SpotifyHelper.get_song_recommendations(accessToken, seed_tracks, avg_danceability, avg_energy, avg_positivity);
    } catch(err) {
        console.log(`There was a problem getting song recommendations: ${err.response.data}`)
    }

    let track_uris = [];
    for(let rec of recs.data.tracks) {
        track_uris.push(rec.uri);
    }

    let user = await SpotifyHelper.get_user(accessToken)
    let user_playlists =  await SpotifyHelper.get_user_playlists(accessToken, user);

    let track_analyzer_playlist = user_playlists.data.items.find(playlist => playlist.name == "Your Track Analyzer Recommendations");
    if(!track_analyzer_playlist) {
        try {
            track_analyzer_playlist = await SpotifyHelper.create_playlist(accessToken, user) // axios.post(playlist_url, data, { headers });
        } catch(err) {
            console.log(`There was a problem creating the 'Your Track Analyzer Recommendations' playlist: ${err.response.data}`)
        }
    }
    try {
        await SpotifyHelper.update_playlist(accessToken, track_analyzer_playlist, track_uris);
        console.log(`Your recommended songs have been added to the 'Your Track Analyzer Recommendations' playlist: ${track_analyzer_playlist.href}`)
        track_uris = [];
    } catch(err) {
        track_uris = [];
        console.log(`There was a problem updating the 'Your Track Analyzer Recommendations' playlist: ${err.response.data}`);
    }
}