module.exports = {
  'SLIME': {
    id: 1,
    name: 'Slime',
    SPD: 0.4,
    HPX: 1,
    HP: 2,
    ATK: 2000000,
    MAG: 2000000,
    RES: 3,
    DEF: 3,
    AI: function*(instance, battleground) {
      let source_id = instance.id
      while(true) {

        yield { source_id, action: 'START' }
        yield { source_id, action: 'MENU', message: '+W+', options: ['OK'] }
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