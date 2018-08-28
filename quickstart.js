var {google} = require('googleapis');

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

const fakeUsers = [
  {
    username: "disco",
    shows: [
      "Dan Patrick Show",
      "First Things First",
    ]
  }
];

getShowMapping = (theseShows) => {
  const returnStuff = [];
  shows.forEach((show) => {
    theseShows.forEach((innerShow) => {
      if(innerShow === show.name) {
        returnStuff.push(show);
      }
    })
  });
  return returnStuff;
}

async function lander(auth, username) {
  let shows = [];
  let returnableIds = [];
  fakeUsers.forEach((user) => {
    if(user.username === username) {
      shows = getShowMapping(user.shows);
    }
  });

  for(let i = 0; i < shows.length; i++) {
    returnableIds = returnableIds.concat(await getUploadPlaylistId(auth, shows[i]));
  };

  for (let i = returnableIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [returnableIds[i], returnableIds[j]] = [returnableIds[j], returnableIds[i]];
  }
  return returnableIds;
}

async function getUploadPlaylistId(auth, show) {
  var service = google.youtube('v3');
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
    var contentDetails = response.data.items;
    if(contentDetails.length == 0) {
      console.log('No channel found.');
    } else {
      return await getVideoIds(auth, contentDetails[0].contentDetails.relatedPlaylists.uploads);
    }
  } catch(err) {
    console.log('The API returned an error: ' + err);
  }
}

async function getVideoIds(auth, uploadsPlayListId) {
  var service = google.youtube('v3');
  try {
    const response = await service.playlistItems.list({
      auth: auth,
      part: 'contentDetails',
      maxResults: '10',
      playlistId: uploadsPlayListId
    });
    return listUpIds(response.data.items);
  } catch(err) {
    console.log('The API returned an error: ' + err);
  }

}

listUpIds = (playlist) => {
  const returnList = [];
  playlist.forEach((item) => {
    returnList.push({
      id: item.contentDetails.videoId,
      date: item.contentDetails.videoPublishedAt,
    })
  });
  return returnList;
}

module.exports = {
  getStarted: lander,
  shows: shows,
}