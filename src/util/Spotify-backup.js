const clientId = 'e210788caaf84127b7fd20d871dba1b1';
const clientSecret = 'f72a96f76e074c5d9edadae6241edb2c';
const redirectURI = 'http://localhost:3000/';
let accessToken= '';

const Spotify = {
  getAccessToken(){
    if (accessToken){
      return accessToken;
    }

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000); //ok
      window.history.pushState('Access Token', null, '/');        //ok
      return accessToken;
    } else {
      const redirectUrl = 'https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}';
      window.location = redirectUrl;
    } //end of else
  }, //end of getAccessToken

  search(term){
    const accessToken = Spotify.getAccessToken();
    return fetch('https://api.spotify.com/v1/search?type=track&q=${term}',
    {
      headers: {Authorization: `Bearer ${accessToken}`}}
    ).then(
      response => response.json()
    ).then(jsonResponse => {
      if (!jsonResponse.tracks){
        return [];
      }
        return jsonResponse.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
      }));//end of map
    });//end of 3rd then
}, //end of search

  savePlaylist(name, trackURIs){
    if (!name || trackURIs.length){
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = {Authorization: `Bearer ${accessToken}`};
    let userId;

      return fetch('https://api.spotify.com/v1/me', {headers: headers}
    ).then(response => response.json()
  ).then(jsonResponse => {
    userId = jsonResponse.id;
    return fetch('https://api.spotify.com/v1/users/${userId}/playlists', {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({name: name})
    }).then(response => response.json()
  ).then(jsonResponse => {
    const playlistId = jsonResponse.id;
    return fetch('https://api.spotify.com//v1/users/{user_id}/playlists/{playlist_id}/tracks', {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({uris: trackURIs})
    });//end of fetch
  });// end of 4th then
 });//end of 2nd then
}//end of savePlaylist
}; //end of Spotify

export default Spotify;
