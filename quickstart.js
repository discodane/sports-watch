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
]

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
  console.log({uploadsPlayListId});
  var service = google.youtube('v3');
  try {
    const response = await service.playlistItems.list({
      auth: auth,
      part: 'contentDetails',
      maxResults: '20',
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
  getUploadPlaylistId: getUploadPlaylistId,
  shows: shows,
}