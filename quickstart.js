const cacher = require('./cacher');

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

async function lander(username) {
  let shows = [];
  let returnableIds = [];
  fakeUsers.forEach((user) => {
    if(user.username === username) {
      shows = user.shows;
    }
  });
  for(let i = 0; i < shows.length; i++) {
    returnableIds = returnableIds.concat(cacher.getShow(shows[i]));
  }

  for (let i = returnableIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [returnableIds[i], returnableIds[j]] = [returnableIds[j], returnableIds[i]];
  }
  return returnableIds;
}

module.exports = {
  getStarted: lander,
  shows: shows,
}