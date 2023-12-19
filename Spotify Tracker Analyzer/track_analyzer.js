const config = require("./config/config")
const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
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
    let track_details = [];
    try {
        console.log("Getting your top 50 tracks")
        let url = config.url + "me/top/tracks?limit=50"
        let headers = {
            "Authorization": `Bearer ${accessToken}`
        }
        let tracks = await axios.get(url, { headers })
        for(let track of tracks.data.items) {
            // console.log(`${track.name} - ${track.artists[0].name} - ${track.album.name}`)
            track_details.push({
                "title": track.name,
                "artist": track.artists[0].name,
                "album": track.album.name,
                "id": track.id
            })
        }
        // console.log(track_ids);
    } catch(err) {
        console.log(err);
    }

    let danceability_count = 0;
    let energy_count = 0;
    let positivity_count = 0;
    let duration_count = 0;
    let artist_count = {};
    let genre_count = {};
    try {
        console.log("Analyzing your top 50 tracks");
        for(let track of track_details) {
            let url = `${config.url}audio-features/${track.id}`
            let headers = {
                "Authorization": `Bearer ${accessToken}`
            }
            try {
                let audio_features = await axios.get(url, { headers })
                // console.log(`${track.title} - ${track.artist} - ${track.album}`)
                // console.log("Danceability: " + audio_features.data.danceability);
                // console.log("Energy: " + audio_features.data.energy);
                // console.log("Positivity: " + audio_features.data.valence)
                danceability_count += audio_features.data.danceability;
                energy_count += audio_features.data.energy;
                positivity_count += audio_features.data.valence;
                duration_count += audio_features.data.duration_ms;

                if(track.artist in artist_count) {
                    artist_count[track.artist] = artist_count[track.artist] + 1;
                } else {
                    artist_count[track.artist] = 1;
                }
            } catch(err) {
                console.log(err);
            }
        }
        let artist_values = Object.entries(artist_count);
        artist_values.sort((a, b) => b[1] - a[1]);
        let top_five = artist_values.slice(0, 5)
        artist_count = Object.fromEntries(top_five);
    } catch(err) {
        console.log(err);
    }

    let avg_danceability = (danceability_count/50);
    let avg_energy = (energy_count/50);
    let avg_positivity = (positivity_count/50);
    console.log("\n");
    console.log("Your results");
    console.log("Danceability: " + avg_danceability);
    console.log("Energy: " + avg_energy);
    console.log("Positivity: " + avg_positivity)
    console.log("\n");
    console.log("Top Artists")
    console.log(Object.keys(artist_count).toString());

}