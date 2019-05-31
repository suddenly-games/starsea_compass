module.exports = {
  'SMACK': {
    name: 'Smack',
    type: 'NATURE',
    mana_cost: 0,
    atb_cost: 4000,
    activate(user, target) {
      let damage = Math.round((0.7 + 0.3 * Math.random() + 0.35) * user.ATK) - target.DEF
      return {
        action: 'DAMAGE',
        source_id: target.id,
        damage
      }
    }
  }
}