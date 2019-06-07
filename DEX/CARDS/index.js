let { randn_bm } = require('../../util')

module.exports = {
  'SMACK': {
    id: 'SMACK',
    name: 'Smack',
    element: 'NONE',
    type: 'SPELL',
    attack: 'PHYSICAL',
    range: 'CLOSE',
    target: 'ENEMY SINGLE',
    power: 35,
    mp_cost: 0,
    atb_cost: 4000,
    activate(user, target) {
      let base = 1 + 0.35
      let rand = 0.6 + 0.4 * randn_bm()
      let damage = Math.round( base * rand * user.ATK )
      return {
        action: 'DAMAGE',
        source_id: target.id,
        damage,
        attack: 'PHYSICAL',
        element: 'NONE'
      }
    }
  },
  'CINDER': {
    id: 'CINDER',
    name: 'Cinder',
    element: 'FIRE',
    type: 'SPELL',
    attack: 'MAGICAL',
    range: 'RANGED',
    target: 'ENEMY SINGLE',
    power: 40,
    mp_cost: 3,
    atb_cost: 4000,
    activate(user, target) {
      let stab = user.element == 'FIRE' ? 1.5 : 1
      let power = 40 / 100
      let base = 1 + power * stab
      let multiplier = 1.2 // Fairy Ring - Fire (Shaya's Leader Skill)
      let effectiveness = 1.5 // Super Effective against Nature
      let rand1 = 1 + 0.2 * randn_bm()
      let rand2 = 1 - 0.2 * randn_bm()
      let damage = ( base * rand1 * user.MAG - rand2 * target.RES ) * multiplier * effectiveness
      damage = Math.round(damage)
      damage = Math.max(damage, 0)
      return {
        action: 'DAMAGE',
        source_id: target.id,
        damage,
        attack: 'MAGICAL',
        element: 'FIRE'
      }
    }
  }
}