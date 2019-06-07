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
      let damage = Math.round((0.5 + 0.3 * Math.random() + 0.35) * user.ATK)
      return {
        action: 'DAMAGE',
        attack: 'PHYSICAL',
        source_id: target.id,
        damage
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
    mp_cost: 4,
    atb_cost: 5000,
    activate(user, target) {
      let damage = Math.max(Math.round((40 * (1.15 - 0.3 * Math.random())) * user.MAG / target.RES),0)
      return {
        action: 'DAMAGE',
        attack: 'MAGICAL',
        source_id: target.id,
        damage
      }
    }
  }
}