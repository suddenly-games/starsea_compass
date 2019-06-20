let { CHARACTERS, DUNGEONS } = require('../DEX')

let main_menu = {
  source_id: 'SYSTEM',
  action: 'MENU',
  message: 'Prepare for your next adventure:',
  options: { 
    'ROSTER_CHANGE' : {
      source_id: 'SYSTEM',
      action: 'DIALOGUE',
      message: 'Use this action to change your team and starting positions.',
      example: {
        action: 'ROSTER_CHANGE',
        position_index: 0,
        character_id: 'SHAYA'
      },
      options: Object.keys(CHARACTERS)
    },
    'ENTER': {
      source_id: 'SYSTEM',
      action: 'DIALOGUE',
      message: 'Use this action to enter the chosen dungeon.',
      example: {
        action: 'ENTER',
        dungeon_id: 'WORLD_TREE_ENTRANCE'
      },
      options: Object.keys(DUNGEONS)
    }
  }
}
module.exports = main_menu