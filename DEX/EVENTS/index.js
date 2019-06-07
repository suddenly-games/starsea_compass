let EVENTS = {
  WORLD_TREE_ENTRANCE: {
    BASIC_TUTORIAL: {
      id: 'BASIC_TUTORIAL',
      floor: 1,
      on: 'ADVANCE',
      battle: true,
      conditions: [],
      actions: [
        {
          action: 'SPAWN',
          source_id: 'TUTORIAL_SLIME',
          level: 4,
          target_index: 10
        },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'A m-monster!?' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'N-nobody said there would be monsters!' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'I need something to fight with...' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'Is that... the Celestial Sword Astraea!?' },
        { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'You picked up a stick.' },
        { source_id: 'SYSTEM', action: 'LOOT', card_id: 'SMACK' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'I\'m ready for you now, foul monster!' },
        { source_id: 'TUTORIAL_SLIME', action: 'DIALOGUE', message: '+W+?' },
        { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'Try using "Smack" against the Slime.', example: {
          action: 'ACTIVATE',
          card_id: 'SMACK',
          target_index: 10
        } }
      ]
    },
    MAGIC_TUTORIAL: {
      floor: 4,
      on: 'ADVANCE',
      battle: false,
      conditions: {
        characters: {
          SHAYA: {
            is_leader: true
          }
        },
      },
      actions: [
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'Hey, what\'s that?' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'Isn\'t that my spellbook?' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: '...' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'Ah!' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'I totally forgot to bring it!' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'What\'s it doing here?' },
        { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'You pick up Shaya\'s Spellbook' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'W-where did all my cards go!?' },
        { source_id: 'SHAYA', action: 'DIALOGUE', message: 'There\'s only one left...' },
        { source_id: 'SYSTEM', action: 'LOOT', card_id: 'CINDER' },
        { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'This FIRE spell card costs MP and does MAGICAL damage.' },
        { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'Characters regenerate a bit of MP at the beginning of each turn.' },
        { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'MAGICAL damage ignores GUARD but enemies can resist it.' },
        { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'Enemies are also strong or weak against certain elements, like FIRE.' },
        { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'Try using CINDER in your next battle!' },
      ]
    }

  }
}



module.exports = EVENTS

