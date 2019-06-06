module.exports = {
  'TUTORIAL_SLIME': {
    id: 0,
    name: 'Slime',
    SPD: 0.5,
    HPX: 1,
    HP: 3,
    ATK: 2,
    MAG: 2,
    RES: 6,
    DEF: 5,
    AI: function*(instance, battleground) {
      let source_id = instance.id
      yield { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'Cards return to your deck when used.' }
      yield { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'Your hand refills up to 6 cards each turn.' }
      yield { source_id, action: 'START' }
      yield { source_id: 'SHAYA', action: 'DIALOGUE', message: 'This thing is kind of tough...' }
      yield { source_id, action: 'DIALOGUE', message: '-W-' }
      yield { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'The Slime GUARDED your attack.' }
      yield { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'GUARD refreshes at the start of each character\'s turn.' }
      yield { source_id: 'SYSTEM', action: 'DIALOGUE', message: 'Smack the Slime multiple times to break its GUARD!' }
      yield { source_id, action: 'SKIP' }
      
      while(true) {
        yield { source_id, action: 'START' }
        yield { source_id, action: 'DIALOGUE', message: '+W+' }
        yield { source_id, action: 'SKIP' }
      }
    }
  },
  'SLIME': {
    id: 1,
    name: 'Slime',
    SPD: 0.5,
    HPX: 1,
    HP: 3,
    ATK: 2,
    MAG: 2,
    RES: 6,
    DEF: 5,
    AI: function*(instance, battleground) {
      let source_id = instance.id
      while(true) {

        yield { source_id, action: 'START' }
        yield { source_id, action: 'DIALOGUE', message: '+W+' }
        yield { source_id, action: 'SKIP' }

        let target_index = 0
        for (let i = 0; i < 10; i++) {
          if (battleground[i].id) target_index = i
        }

        yield { source_id, action: 'START' }
        yield { source_id, action: 'ACTIVATE', card_id: 'SMACK', target_index }

      }
    }
  }
}