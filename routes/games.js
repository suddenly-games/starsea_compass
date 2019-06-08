var router = require('express').Router()
let { ENEMIES, CARDS, CHARACTERS, EVENTS } = require('../DEX')

let game

let { randInt, randn_bm, clone } = require('../util')

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

  
  //
  // Inventory Stuff
  let deck = []
  let hand = []

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
  let dungeon = {
    id: 'WORLD_TREE_ENTRANCE',
    name: 'World Tree Entrance'
  }
  //
  // Menu Stuff
  let menu = []

  // Event Stuff
  let event_queue = []

  //
  // Game Actions
  let perform_action = (data) => {
    let key  = data.action.toUpperCase()
    let char = select(data.source_id)

    let next = []
    let waiting_for_player = false

    const ACTIONS = {
      ACTIVATE(action) {
        let target = battleground[action.target_index]
        let card = select(action.card_id)

        if (card.mp_cost > char.MP) {
          action.message = `Not enough MP to do that!`
          waiting_for_player = true
          return action
        }

        if (target.id) {
          action.message = `${char.name} used ${card.name} on ${target.name}!`
          char.ATB = 10000 - card.atb_cost
          if (select('active players').includes(char)) {
            char.MP -= card.mp_cost
            hand.splice(hand.indexOf(data.card_id),1)
            deck.push(data.card_id)
          }
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
      ADVANCE(action) {
        floor++
        let events = Object.values(EVENTS[dungeon.id]).filter(e => e.floor == floor && e.on == 'ADVANCE')
        let skip = false
        if(events) {
          for(let event of events) {
            if (!event.completed) {
              event_queue = event_queue.concat(event.actions)
              if(event.battle) {
                skip = true
              }
            }
          }
        }
        action.message = `Entering Floor ${floor}...`

        for(let player of select('all players')) {
          level_up(player)
        }

        if (!skip) {

          let spawn_count = Math.min(floor, 2 + randInt(4) )
          for(let i = 0; i < spawn_count; ++i) {
            next.push({
              source_id: 'SLIME',
              action: 'SPAWN',
              level: Math.round(1.2 * floor + 0.3 * floor * randn_bm() + 4 * randn_bm()),
              target_index: 10 + i
            })
          }

        }

        return action
      },
      BREAK(action) {
        action.message = `${char.name}'s guard broke!`
        char.ATB = Math.max(char.ATB - 5000, 0)
        if (turn_queue.includes(char)) {
          turn_queue.splice(turn_queue.indexOf(char), 1)
        }
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
      CLEAR(action){
        action.message = `${char.name} cleared floor ${floor}!`
        next.push({
          source_id: 'PLAYER',
          action: 'ADVANCE'
        })
        return action
      },
      DAMAGE(action) {
        let damage = action.damage
        if (action.attack == 'PHYSICAL' && char.GUARD > 0) {
          let blocked = Math.min(char.GUARD, action.damage)
          action.action = 'BLOCK'
          action.blocked = blocked
          char.GUARD -= blocked
          damage -= blocked
          action.message = `${char.name} blocked ${blocked} damage.`
          if (char.GUARD <= 0) {
            next.push({ action: 'BREAK', source_id: char.id })
            if (damage > 0) {
              next.push({ action: 'DAMAGE', source_id: char.id, damage, attack: 'PHYSICAL', element: action.element })
            }
          }
          return action
        }
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
      DIALOGUE(action) {
        return action
      },
      DRAW(action) {
        if (deck.length) {
          let random_index = randInt(deck.length)
          let card_id = deck[random_index]
          deck.splice(random_index, 1)
          let card = select(card_id)
          hand.push(card_id)
          action.message = `${ char.name } drew "${ card.name }"`
        }
        else {
          action.source_id = 'SYSTEM'
          action.message = `We tried to make you draw a card when your deck is empty. BRUH.`
        }
        return action
      },
      LOOT(action) {
        action.source_id = 'SYSTEM'
        let card = select(action.card_id)
        if (card) {
          deck.push(card.id)
          action.message = `"${ card.name }" was added to the deck.`
        }
        else {
          action.message = `We tried to give you a card that doesn't exist. BRUH.`
        }
        return action
      },
      MENU(action) {
        action.source_id = 'SYSTEM'
        waiting_for_player = true
        menu = action.options
        return action
      },
      SKIP(action) {
        char.ATB = 7000
        turn_queue.shift()
        action.message = `${char.name} did nothing...`
        return action
      },
      SPAWN(action) {
        enemy_id++
        let instance = {}
        instance.ATB = 5000
        instance.level = action.level
        instance.id  = action.source_id + ':' + enemy_id
        instance.name = char.name
        instance.element = char.element
        instance.SPD = char.SPD * (100 + action.level) + 0.1 * randInt(action.level)
        instance.HP = char.HP * (10 + action.level)  + randInt(action.level)
        instance.ATK = char.ATK * (3 + action.level) + randInt(action.level)
        instance.MAG = char.MAG * (3 + action.level) + randInt(action.level)
        instance.RES = char.RES * (3 + action.level) + randInt(action.level)
        instance.DEF = char.DEF * (3 + action.level) + randInt(action.level)
        instance.GUARD = instance.DEF
        instance.MAX_HP = instance.HP
        instance.actions = char.AI(instance, battleground)
        battleground[action.target_index] = instance
        action.source_id = instance.id
        action.message = `${instance.name} appeared!`
        return action
      },
      START(action) {
        char.GUARD = char.DEF
        if (select('active players').includes(char)) {
          char.MP = Math.min(char.MP + char.MPX, char.MAX_MP)
          let cards_drawn = Math.min(deck.length, 6 - hand.length)
          for(let i = 0; i< cards_drawn; ++i) {
            next.push({
              source_id: char.id,
              action: 'DRAW'
            })
          }
          waiting_for_player = true
        }
        action.message = `${char.name}'s turn!`
        return action
      },
      SWITCH(action) {
        let a = action.a_index
        let b = action.b_index

        let temp = battleground[a]
        battleground[a] = battleground[b]
        battleground[b] = temp
        
        action.message = `${battleground[a].name} switched with ${battleground[b].name}.`

        return action
      }
    }

    let result = ACTIONS[key](data)
    log.push(result)
    log_new++

    for(let action of next) {
      waiting_for_player = perform_action(action) ? true : waiting_for_player
    }

    return waiting_for_player

  }

  perform_action({
    action: 'ADVANCE',
    source_id: 'PLAYER'
  })

  let load_character = (id, level) => {
    let char = select(id)
    let instance = {}
    instance.ATB = 5000
    instance.id = char.id + ':PLAYER'
    instance.name = char.name
    instance.element = char.element
    instance.SPD = char.SPD * (100 + level)
    instance.HP = char.HP * (10 + level)
    instance.MP = char.MP * (10 + level)
    instance.MPX = char.MPX
    instance.ATK = char.ATK * (3 + level)
    instance.MAG = char.MAG * (3 + level)
    instance.RES = char.RES * (3 + level)
    instance.DEF = char.DEF * (3 + level)
    instance.GUARD = char.DEF
    instance.MAX_HP = instance.HP
    instance.MAX_MP = instance.MP
    return instance
  }

  let level_up = (instance) => {
    let char = select(instance.id.split(':')[0])
    instance.SPD += char.SPD
    instance.HP += char.HP
    instance.MAX_HP += char.HP
    instance.MP += char.MP
    instance.MAX_MP += char.MP
    instance.ATK += char.ATK
    instance.MAG += char.MAG
    instance.RES += char.RES
    instance.DEF += char.DEF
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
  let process_events = () => {
    while(event_queue.length) {
      let action = event_queue[0]
      let wait_for_player = perform_action(action)
      event_queue.shift()
      if (wait_for_player) return wait_for_player
    }
  }

  this.inputAction = (data) => {
    data.source_id = turn_queue.length ? turn_queue[0].id : 'PLAYER'
    if (menu.length && data.action != 'CHOOSE') {
      perform_action({
        action: 'MENU',
        source_id: 'SYSTEM',
        message: 'Please CHOOSE an option!',
        options: menu
      })
      return this.toJSON()
    }
    if (data.action == 'ACTIVATE' && !hand.includes(data.card_id)) {
      perform_action({
        action: 'DIALOGUE',
        source_id: 'SYSTEM',
        message: 'That card is not in your hand!'
      })
      return this.toJSON()
    }
    let try_again = perform_action(data)
    if (try_again) return this.toJSON()
    return null
  }

  this.toJSON = () => {
    let result = {}
    result.floor_info = `${dungeon.name}: Floor ${floor}`
    if (turn_queue.length) result.current_player = turn_queue[0].name
    result.deck = deck.length
    result.hand = hand
    result.log = log.slice(-log_new),
    result.battleground = battleground
    return result
  }



  this.next = () => {
    while(true) {
      if (event_queue.length)  {
        let wait_for_player = process_events()
        if (wait_for_player) return this.toJSON()
      }
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