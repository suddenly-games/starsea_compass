module.exports = {
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
        yield { source_id, action: 'ACTIVATE', card: 'SMACK', target_index }

      }
    }
  }
}