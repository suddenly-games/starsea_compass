var router = require('express').Router()

let game

router.post('/', (req, res, next) => {

  if (!game) {
    game = new Game()
  }
  else {
    game.renewLog()
    game.inputAction(req.body)
  }
  let response = game.next()
  res.send(response)
})

function Game() {

  //
  // Action Log
  let log_new = 0
  let log = []
  this.renewLog = () => {
    log_new = 0
  }

  //
  // Battleground
  let battleground = [

          {}, {},       // Player Frontline
        {}, {}, {},     // Player Backline
    {}, {}, {}, {}, {}, // Player Reserve

          {}, {},       // Enemy Frontline
        {}, {}, {},     // Enemy Backline
    {}, {}, {}, {}, {}, // Enemy Reserve

  ]

  // Temporary
  battleground[0] = {
    id: '001_SHAYA',
    name: 'Shaya',
    ATB: 5000,
    SPD: 99
  }
  battleground[10] = {
    id: '001_SLIME',
    name: 'Slime',
    ATB: 5000,
    SPD: 127
  }

  // Target Selection
  let select = type => {
    const key = type.toUpperCase().split(' ').join('_')

    const SELECT = {
      ALL_PLAYERS:        () => battleground.slice(0,10),
      ACTIVE_PLAYERS:     () => battleground.slice(0,5),
      FRONT_ROW_PLAYERS:  () => battleground.slice(0,2),
      BACK_ROW_PLAYERS:   () => battleground.slice(2,5),
      RESERVE_PLAYERS:    () => battleground.slice(5,10),
      ALL_ENEMIES:        () => battleground.slice(10,20),
      ACTIVE_ENEMIES:     () => battleground.slice(10,15),
      FRONT_ROW_ENEMIES:  () => battleground.slice(10,12),
      BACK_ROW_ENEMIES:   () => battleground.slice(12,15),
      RESERVE_ENEMIES:    () => battleground.slice(15,20),
      ALL_CHARACTERS:     () => battleground,
      ACTIVE_CHARACTERS:  () => SELECT.ACTIVE_PLAYERS().concat(SELECT.ACTIVE_ENEMIES()),
    }
    
    let selection = key in SELECT ? SELECT[key]() : battleground.find(char => char.id == key)
    return selection.length ? selection.filter(char => char.id != null) : selection
  }


  //
  // Turn Queue
  let turn_queue = []
  let mid_turn = false

  let advance_timers = () => {
    for(let char of select('active characters')) {
      char.ATB += char.SPD
      if (char.ATB >= 10000) {
        turn_queue.push(char)
      }
    }
    turn_queue.sort((a,b) => {
      return b.ATB - a.ATB || b.SPD - a.SPD
    })
  }

  //
  // Game Actions
  let perform_action = (data) => {
    let key  = data.action.toUpperCase()
    let char = select(data.source_id)

    const ACTIONS = {
      START(action) {
        mid_turn = true
        action.message = `${char.name}'s turn!`
        return action
      },
      SKIP(action) {
        char.ATB = 7000
        mid_turn = false
        turn_queue.shift()
        action.message = `${char.name} did nothing...`
        return action
      },
    }
    let result = ACTIONS[key](data)
    log.push(result)
    log_new++
  }

  let advance_turns = () => {
    while(turn_queue.length && select('active enemies').includes(turn_queue[0])) {
      let source_id = turn_queue[0].id
      perform_action({ source_id, action: 'START' })
      perform_action({ source_id, action: 'SKIP' })
    }
    if (turn_queue.length && !mid_turn) {
      let source_id = turn_queue[0].id
      perform_action({ source_id, action: 'START' })
    }
  }

  this.inputAction = (data) => {
    data.source_id = turn_queue[0].id
    perform_action(data)
  }

  this.toJSON = () => {
    return {
      log: log.slice(-log_new),
      battleground
    }
  }

  this.next = () => {
    while(true) {
      if (!turn_queue.length) advance_timers()
      if (turn_queue.length)  advance_turns()
      if (turn_queue.length)  return this.toJSON()
    }
  }

  return this
}

module.exports = router