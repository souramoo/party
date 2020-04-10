module.exports = Object.freeze({
  PLAYER_RADIUS: 40,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 200,
  PLAYER_FIRE_COOLDOWN: 2,

  BULLET_RADIUS: 3,
  BULLET_SPEED: 800,
  BULLET_DAMAGE: 10,

  SCORE_BULLET_HIT: 20,
  SCORE_PER_SECOND: 1,

  CALL_DISTANCE: 400,

  MAP_SIZE: 3000,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    INPUT: 'input',
    EMOTE: 'emote',
    GAME_OVER: 'dead',
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
