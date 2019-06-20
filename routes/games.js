var router = require('express').Router()
var Game = require('../game')

let game

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

module.exports = router