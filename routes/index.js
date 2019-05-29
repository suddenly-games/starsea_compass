var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

res.write('       .__.. ,              __ .               .                     \n')
res.write(' ___   [__]|-+- _.*._. _   /  `|_ ._. _ ._ * _.| _  __   ___         \n')
res.write('       |  || | (_]|[  (/,  \\__.[ )[  (_)[ )|(_.|(/,_)                \n')
res.write('                                                                     \n')
res.write('.___..        __. ,                   __                             \n')
res.write('  |  |_  _   (__ -+- _.._. __ _  _.  /  ` _ ._ _ ._  _. __ __        \n')
res.write('  |  [ )(/,  .__) | (_][  _) (/,(_]  \\__.(_)[ | )[_)(_]_) _)         \n')
res.write('                                                 |                   \n')
res.write('.        __.     .  .      .     .__                  _,  _,  ,   _, \n')
res.write('|_   .  (__ . . _| _| _ ._ |  .  [ __ _.._ _  _  __  \'_) |.| /|  (_) \n')
res.write('[_)\\_|  .__)(_|(_](_](/,[ )|\\_|  [_./(_][ | )(/,_)   /_. |_| .|.   | \n')
res.write('   ._|                      ._|                                     \n')

  res.end();
});

module.exports = router;
