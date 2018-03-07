'use strict'

const Markup = require('telegraf/markup')

const keys = ['now', 'in 10 min', 'in 1 hour']

const whenKeyboard = Markup.keyboard(keys).oneTime().extra()

module.exports = whenKeyboard
