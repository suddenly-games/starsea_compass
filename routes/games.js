var router = require('express').Router()

let game

router.post('/', (req, res, next) => {

  if (!game) {
    console.log('New Game')
    game = {
      turn_queue: [],
      log_new: 0,
      log: [],
      characters : {
        slime1: {
          id: 'slime1',
          is_enemy: true,
          zone: 'front',
          slot: 2,
          ATB: 5000,
          SPD: 99
        },
        slime2: {
          id: 'slime2',
          is_enemy: true,
          zone: 'back',
          slot: 1,
          ATB: 5000,
          SPD: 122
        },
        slime3: {
          id: 'slime3',
          is_enemy: true,
          zone: 'back',
          slot: 2,
          ATB: 5000,
          SPD: 177
        },
        shaya: {
          id: 'shaya',
          is_enemy: false,
          zone: 'front',
          slot: 2,
          ATB: 5000,
          SPD: 153
        },
        miki: {
          id: 'miki',
          is_enemy: false,
          zone: 'front',
          slot: 2,
          ATB: 5000,
          SPD: 152
        }
      }
    }
  }

  // Player Turns
  else {
    console.log('Player Turn')
    // Reset log_new
    game.log_new = 0
  
    let id = game.turn_queue[0].id

    // Player Action
    game.characters[id].ATB = 10000
    game.characters[id].ATB -= 3000
    let action = {
      source_id: id,
      action: 'Did Nothing'
    }
    game.log.push(action)
    game.log_new++
    game.turn_queue.shift()
  }


  // Ticker Loop waits for player to reach the front of the game queue
  console.log('Start Turn Loop')
  while (true) {

    if (!game.turn_queue.length) {

      console.log('Tick Forwards')
      for (let id in game.characters) {
        let char = game.characters[id]
        char.ATB += char.SPD
      }
    
      console.log('Check ATB and Load Queue')
      for (let id in game.characters) {
        let char = game.characters[id]
        if (char.ATB >= 10000) {
          game.turn_queue.push(char)
        }
      }
    }

    if (game.turn_queue.length) {

      console.log('Sort Queue by Priority')
       game.turn_queue.sort((a,b) => {
        return b.ATB - a.ATB || b.SPD - a.SPD
      })
    
      console.log('Process Turn Queue while Enemy Turn')
      while (game.turn_queue.length && game.turn_queue[0].is_enemy) {
        let id = game.turn_queue[0].id
        console.log('Current Turn: ' + id)
        console.log(game.characters[id])
        game.characters[id].ATB = 10000
        game.characters[id].ATB -= 3000
        let action = {
          source_id: id,
          action: 'Did Nothing'
        }
        game.log.push(action)
        game.log_new++
        game.turn_queue.shift()
      }
      console.log('All Enemies Processed')

      if (game.turn_queue.length) {
        console.log('Send Game back if Player Turn')
  
        let data = JSON.parse(JSON.stringify(game))
        data.turn_queue = data.turn_queue.map(char => char.id)
        data.log = data.log.slice(-data.log_new)
  
        return res.send(data)
      }

    }

  }
})

module.exports = router