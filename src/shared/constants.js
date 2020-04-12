module.exports = Object.freeze({
  PLAYER_RADIUS: 40,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 200,

  CALL_DISTANCE: 300,

  MAP_SIZE: 1500,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    EMOTE: 'emote',
    BRDCST_PLAYER_ENTERED: 'entered',
    BRDCST_PLAYER_LEFT: 'left',
  },
  EMOJIS: {
    neutral: '😐',
    happy: '😄',
    sad: '😢',
    angry: '🤬',
    fearful: '😱',
    disgusted: '😠',
    surprised: '😮',
  },
  ICE_SERVERS: [
    { url: 'stun:stun.l.google.com:19302' },
    {
      url: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com',
    },
  ],
});
