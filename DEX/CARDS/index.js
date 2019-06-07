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
      let rand = 0.6 + 0.1 * Math.random() + 0.1 * Math.random() + 0.1 * Math.random() + 0.1 * Math.random()
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
    atb_cost: 5000,
    activate(user, target) {
      let base = 1 + 0.4 * 1.5
      let multiplier = 1.2
      let effectiveness = 1.5
      let rand1 = 1 + 0.1 * Math.random() + 0.1 * Math.random()
      let rand2 = 1 - 0.1 * Math.random() - 0.1 * Math.random()
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