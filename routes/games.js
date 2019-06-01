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
    let err = game.inputAction(req.body)
    if (err) return res.send(err)
  }
  let response = game.next()
  return res.send(response)
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
      key == 'SYSTEM' ? { id: 'SYSTEM', name: 'System' } :
      key in SELECT ? SELECT[key]() : 
      key in ENEMIES ? ENEMIES[key] :
      key in CARDS ? CARDS[key] :
      key in CHARACTERS ? CHARACTERS[key] : 
      battleground.find(char => char.id == key)

    return selection.length ? selection.filter(char => char.id != null)||[] : selection
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

  //
  // Floor stuff & dungeon 
  let floor = 0
  let dungeon_name = "World Tree Entrance"

  //
  // Menu Stuff
  let menu = []

  //
  // Game Actions
  let perform_action = (data) => {
    let key  = data.action.toUpperCase()
    let char = select(data.source_id)

    let next = []
    let waiting_for_player = false

    const ACTIONS = {
      START(action) {
        if (select('active players').includes(char)) {
          waiting_for_player = true
        }
        action.message = `${char.name}'s turn!`
        return action
      },
      SKIP(action) {
        char.ATB = 7000
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
            turn_queue.shift()
          }
          next.push(card.activate(char, target))
        }
        else {
          if (select('active players').includes(char)) {
            waiting_for_player = true
          }
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
        if (!select('active players').length) {
          next.push({
            action: 'MENU',
            source_id: 'SYSTEM',
            message: 'GAME OVER!',
            options: ['Try Again']
          })
        }
        return action
      },
      SPAWN(action) {
        enemy_id++
        let instance = {}
        instance.ATB = 5000
        instance.level = action.level
        instance.id  = action.source_id + ':' + enemy_id
        instance.SPD = char.SPD * (100 + action.level)
        instance.HP = char.HP * (10 + action.level)
        instance.ATK = char.ATK * (5 + action.level)
        instance.MAG = char.MAG * (5 + action.level)
        instance.RES = char.RES * (5 + action.level)
        instance.DEF = char.DEF * (5 + action.level)
        instance.actions = char.AI(instance, battleground)
        instance.name = char.name
        battleground[action.target_index] = instance
        action.message = `${instance.name} appeared!`
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
      },
      DIALOGUE(action) {
        return action
      },
      MENU(action) {
        action.source_id = 'SYSTEM'
        waiting_for_player = true
        menu = action.options
        return action
      },
      CHOOSE(action) {
        char = select('player')
        action.source_id = char.id
        if (menu.includes(action.option)) {
          action.message = `${char.name} chose ${action.option}.`
          menu = []
        }
        else {
          action.message = `Invalid choice!`
          action.options = menu
          waiting_for_player = true
        }
        return action
      },
    }

    let result = ACTIONS[key](data)
    log.push(result)
    log_new++

    for(let action of next) {
      perform_action(action)
    }

    return waiting_for_player

  }
  
  perform_action({
    action: 'DIALOGUE',
    source_id: 'SYSTEM',
    message: 'Hello World!'
  })
  
  perform_action({
    action: 'ADVANCE',
    source_id: 'PLAYER'
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
    let waiting_for_player = false
    while(turn_queue.length && !waiting_for_player) {
      let char = turn_queue[0]
      if (char.actions) {
        let action = char.actions.next().value
        waiting_for_player = perform_action(action)
      }
      else {
        waiting_for_player = perform_action({ source_id: char.id, action: 'START' })
      }
    }
    return waiting_for_player
  }

  this.inputAction = (data) => {
    data.source_id = turn_queue[0].id
    if (menu.length && data.action != 'CHOOSE') {
      perform_action({
        action: 'MENU',
        source_id: 'SYSTEM',
        message: 'Please CHOOSE an option!',
        options: menu
      })
      return this.toJSON()
    }
    let try_again = perform_action(data)
    if (try_again) return this.toJSON()
    return null
  }

  this.toJSON = () => {
    let result = {}
    result.floor_info = `${dungeon_name}: Floor ${floor}`
    if (turn_queue.length) result.current_player = turn_queue[0].name
    result.log = log.slice(-log_new),
    result.battleground = battleground
    return result
  }

  this.next = () => {
    while(true) {
      if (!turn_queue.length) advance_timers()
      if (turn_queue.length)  {
        let wait_for_player = advance_turns()
        if (wait_for_player) return this.toJSON()
      }
    }
  }

  return this
}

module.exports = router