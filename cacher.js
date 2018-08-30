const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
const {google} = require('googleapis');

const service = google.youtube('v3');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';
const OAuth2 = google.auth.OAuth2;
let oauth2Client;

function authorize(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      console.log('creds good!');
      pull(oauth2Client);
    }
  });
}

getNewToken = (oauth2Client) => {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
    });
  });
}

storeToken = (token) => {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
  console.log('Token stored to ' + TOKEN_PATH);
}

const shows = [
  {
    name: "First Things First",
    id: "UCOTPo2y-NHJjg1EuENrxypA",
    type: "channel",
  },
  {
    name: "Dan Patrick Show", 
    id: "TheDanPatrickShow",
    type: "user",
  }, 
  {
    name: "Undisputed",
    id: "UCLXzq85ijg2LwJWFrz4pkmw",
    type: "channel",
  },
  {
    name: "The Herd",
    id: "UCFDidMd82mpDkKijLUqHp7A",
    type: "channel",
  },
  {
    name: "Speak For Yourself",
    id: 'UCIv0wH_CdWgttwX6B-Cyt8w',
    type: "channel",
  },
];

pull = (auth) => {
  if(!auth) {
    auth = oauth2Client;
  }
  shows.forEach(async (show) => {
    const params = show.type === "channel" ? {
      auth: auth,
      part: "contentDetails",
      id: show.id,
    } :
    {
      auth: auth,
      part: "contentDetails",
      forUsername: show.id,
    }
    try {
      const response = await service.channels.list(params);
      const contentDetails = response.data.items;
      if(!contentDetails.length) {
        console.log(`No channel found for ${show.id}`);
      } else {
        getVideoIds(auth, contentDetails[0].contentDetails.relatedPlaylists.uploads, show.name);
      }
    } catch(err) {
      console.log('The API returned an error: ' + err);
    }
  });
}

getVideoIds = async (auth, uploadsPlayListId, name) => {
  try {
    const response = await service.playlistItems.list({
      auth: auth,
      part: 'contentDetails',
      maxResults: '10',
      playlistId: uploadsPlayListId
    });
    const filteredList = await filterer(auth, response.data.items, name);
    const finalList = listUpIds(filteredList);
    myCache.set(name, { list: finalList }, 0, (err, res) => {
      if(err) {
        console.log('err loading to cache', err);
      } else {
        console.log(`${name} was added to the cache`);
      }
    });
    //add it to the cache here.
  } catch(err) {
    console.log('The API returned an error: ' + err);
  }
}

listUpIds = (playList) => {
  const returnList = [];
  playList.forEach((item) => {
    returnList.push({
      id: item.contentDetails.videoId,
      date: item.contentDetails.videoPublishedAt,
    })
  });
  return returnList;
}

getShow = (showName) => {
  const value = myCache.get(showName);
  return value.list
}

filterer = async (auth, playList, name) => {
  if(name !== "First Things First") return playList;
  const returnList = [];
  for(let i = 0; i < playList.length; i++) {
    try {
      const response = await service.videos.list({
        auth: auth,
        id: playList[i].contentDetails.videoId,
        part: "snippet",
      });
      if(response.data.items && !response.data.items[0].snippet.title.includes('podcast')) {
        returnList.push(playList[i]);
      }
    } catch(err) {
      console.log("there was an error", err);
    }
  };
  return returnList;
}

setTimeout(pull, 600000);
fs.readFile('client_secret.json', (err, content) => {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the YouTube API.
  authorize(JSON.parse(content));
});

module.exports = {
  getShow: getShow,
}