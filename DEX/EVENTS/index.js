let EVENTS = {
  WORLD_TREE_ENTRANCE: [
    {
      floor: 1,
      battle: true,
      conditions: [],
      actions: [
        {
          action: 'SPAWN',
          source_id: 'TUTORIAL_SLIME',
          level: 4,
          target_index: 10
        },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'A-a monster !?' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'I need something to fight with...' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'Is that... the Celestial Sword Astraea !?' },
        { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'You picked up a stick.' },
        { source_id: 'SYSTEM', action: 'MENU', message: 'The "Smack" Card was added to your deck.', options: ['OK'], example: {
          action: 'CHOOSE',
          option: 'OK'
        } },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'I\'m ready for you now, vile creature!' },
        { source_id: 'TUTORIAL_SLIME', action: 'DIALOGUE', message: '+W+?' },
        { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'Try using "Smack" against the Slime.', example: {
          action: 'ACTIVATE',
          card: 'SMACK',
          target_index: 10
        } }
      ]
    },
    {
      floor: 4
    }
  ]
}



module.exports = EVENTS

