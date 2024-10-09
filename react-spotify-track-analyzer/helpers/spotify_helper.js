const config = require("../config/config")
const axios = require("axios");

module.exports = {
    async get_top_tracks(accessToken) {
        // console.log("Getting your top 50 tracks")
        let url = config.url + "me/top/tracks?limit=50"
        let headers = {
            "Authorization": `Bearer ${accessToken}`
        }
        let tracks = []
        try {
            tracks = await axios.get(url, { headers })
        } catch(err) {
            console.log(err);
        }
        return tracks;
    },

    async get_tracks_details(accessToken, track_ids) {
        let url = config.url + `audio-features?ids=${track_ids.toString()}`
        let headers = {
            "Authorization": `Bearer ${accessToken}`
        }
        let result;
        try {
            result = await axios.get(url, { headers })
        } catch(err) {
            console.log(err);
        }
        return result;
    },

    async get_song_recommendations(accessToken, artists, danceability, energy, positivity) {
        console.log("Getting Recommendations");
        let url = config.url + `recommendations?seed_artists=${artists}&target_danceability=${danceability}&target_energy=${energy}&target_valence=${positivity}&target_popularity=1`
        let headers = {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${accessToken}`
        }
        let result;
        try {
            result = await axios.get(url, { headers })
        } catch(err) {
            console.log(err.data);
        }
        return result;
    },

    async get_user(accessToken) {
        let url = config.url + "me";
        let headers = {
            "Authorization": `Bearer ${accessToken}`
        }
        return await axios.get(url, { headers });
    },

    async get_user_playlists(accessToken, user) {
        console.log("Getting User's Playlists");
        let url = config.url + `users/${user.data.id}/playlists`
        let headers = {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${accessToken}`
        }
        let result;
        try {
            result = await axios.get(url, { headers })
        } catch(err) {
            console.log(err);
        }
        return result;
    },

    async create_playlist(accessToken, user) {
        console.log("Creating Tracker Analyzer Playlist");
        let url = config.url + `users/${user.data.id}/playlists`
        let headers = {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${accessToken}`
        }
        let data = {
            "name": "Your Track Analyzer Recommendations",
            "description": "Playlist created by Track Analyzer",
            "public": false
        }
        let result;
        try {
            result = await axios.post(url, data, { headers })
        } catch(err) {
            console.log(err);
        }
        return result;
    },

    async update_playlist(accessToken, playlist, track_uris) {
        console.log("Updating Tracker Analyzer Playlist");
        let url = config.url + `playlists/${playlist.id}/tracks`
        let headers = {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${accessToken}`
        }
        let data = {
            'uris': track_uris,
        }
        try {
            await axios.put(url, data, { headers })
        } catch(err) {
            console.log(err);
        }
    }
}