// Calculate the score and adaptative dB level
module.exports = function (answers) {
  const baremo = {
    'procedence': {
      'home': 1,
      'transit': 3,
      'other': 2
    },

    'noise-disturbance' : {
      0: 0,
      1: 3,
      2: 4
    },

    'source' : {
      'motor' : 2,
      'work': 2,
      'leisure': 2,
      'unknown': 1
    },

    'noisy-area' : {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      4: 5
    },

    'sleep-quality' : {
      0: 1,
      1: 3,
      2: 5
    },

    'for-working-here' : {
      'yes': 0,
      'no': 3
    },

    'at-home' : {
      'better': 0,
      'same': 1,
      'worse': 2
    },

    'continuous' : {
      'yes': 0,
      'no': 0
    },

    'for-living-here' : {
      'yes': 0,
      'no': 3
    },

    'other-time' : {
      'better': 0,
      'same': 1,
      'worse': 2
    },

    'thirty-mins' : {
      'better': 0,
      'same': 1,
      'worse': 3
    },
  }

  // Range: 7 - 28
  let score = 0
  for (let key in answers) {
    const answer = answers[key]
    score += baremo[key][answer] || 0
  }

  let decibels = 30

  // Reference points:
  // 7 ~ 30
  // 14 ~ 55
  // 28 ~ 100

  if (score > 7 && score < 14) {
    decibels = 30 + (55 - 30) * (score-7) / (14-7)
  } else if (score < 28) {
    decibels = 55 + (100 - 55) * (score-14) / (28-14)
  }

  return ({score, decibels})
}
