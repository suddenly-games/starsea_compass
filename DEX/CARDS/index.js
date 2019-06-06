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
    mana_cost: 0,
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
  }
}