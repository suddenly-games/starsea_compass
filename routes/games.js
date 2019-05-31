var router = require('express').Router()
let { ENEMIES, CARDS, CHARACTERS } = require('../DEX')

let game

let clone = obj => JSON.parse(JSON.stringify(obj))
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

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

  
  
  let deck = {
    hand: {
      
    },
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
    
    let selection = 
      key == 'PLAYER' ? { id: 'PLAYER', name: 'You' } :
      key in SELECT ? SELECT[key]() : 
      key in ENEMIES ? clone(ENEMIES[key]) :
      key in CARDS ? CARDS[key] :
      key in CHARACTERS ? CHARACTERS[key] : 
      battleground.find(char => char.id == key)

    return selection.length ? selection.filter(char => char.id != null) : selection
  }

  
  let position_of = id => battleground.indexOf(select(id))

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
  // Enemy Stuff
  let enemy_id = 0

  // Floor stuff & dungeon 

  let floor = 0
  let dungeon_name = "World Tree Entrance"


  //
  // Game Actions
  let perform_action = (data) => {
    let key  = data.action.toUpperCase()
    let char = select(data.source_id)

    let next = []

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
      ACTIVATE(action) {
        let target = battleground[action.target_index]
        let card = select(action.card)
        if (target.id) {
          action.message = `${char.name} used ${card.name} on ${target.name}!`
          char.ATB = 10000 - card.atb_cost
          if (char.ATB < 10000) {
            mid_turn = false
            turn_queue.shift()
          }
          next.push(card.activate(char, target))
        }
        else {
          action.message = `There's nothing there...`
        }
        return action
      },
      DAMAGE(action) {
        char.HP -= action.damage
        if (char.HP <= 0) {
          next.push({
            action: 'DEATH',
            source_id: char.id
          })
        }
        action.message = `${char.name} took ${action.damage} damage.`
        return action
      },
      DEATH(action) {
        action.message = `${char.name} died :(`
        battleground[position_of(action.source_id)] = {}
        if (!select('active enemies').length) {
          next.push({
            source_id: 'PLAYER',
            action: 'CLEAR'
          })
        }
        return action
      },
      SPAWN(action) {
        enemy_id++
        char.ATB = 5000
        char.level = action.level
        char.id  = action.source_id + ':' + enemy_id
        char.SPD = char.SPD * (100 + action.level)
        char.HP = char.HP * (10 + action.level)
        char.ATK = char.ATK * (5 + action.level)
        char.MAG = char.MAG * (5 + action.level)
        char.RES = char.RES * (5 + action.level)
        char.DEF = char.DEF * (5 + action.level)
        battleground[action.target_index] = char
        action.message = `${char.name} appeared!`
        return action
      },
      CLEAR(action){
        action.message = `${char.name} cleared floor ${floor}!`
        next.push({
          source_id: 'PLAYER',
          action: 'ADVANCE'
        })
        return action
      },
      ADVANCE(action) {
        floor++
        action.message = `Entering Floor ${floor}...`

        let spawn_count = Math.min(floor, 1 + getRandomInt(5) )
        
        for(let i = 0; i < spawn_count; ++i) {
          next.push({
            source_id: 'SLIME',
            action: 'SPAWN',
            level: floor + getRandomInt(6), 
            target_index: 10 + i
          })
        }

        return action
      }
    }

    let result = ACTIONS[key](data)
    log.push(result)
    log_new++

    for(let action of next) {
      perform_action(action)
    }

  }
  
  perform_action({
    source_id: 'PLAYER',
    action: 'ADVANCE' 
  })

  let load_character = (id, level) => {
    let char = select(id)
    char.SPD = char.SPD * (100 + level)
    char.HP = char.HP * (10 + level)
    char.ATK = char.ATK * (5 + level)
    char.MAG = char.MAG * (5 + level)
    char.RES = char.RES * (5 + level)
    char.DEF = char.DEF * (5 + level)
    return char
  }

  battleground[0] = load_character('SHAYA', floor)

  let advance_turns = () => {
    while(turn_queue.length && select('active enemies').includes(turn_queue[0])) {
      let source_id = turn_queue[0].id
      perform_action({ source_id, action: 'START' })
      // Later we will generate an action based on the enemy script here
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
      floor_info: `${dungeon_name}: Floor ${floor}`,
      current_player: turn_queue[0].name,
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