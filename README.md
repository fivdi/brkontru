## brkontru - Break on Through (to the Other Side!)

Easy access to the BeagleBone Black expansion headers.

## Installation

    $ npm install brkontru

## Usage

```js
var bot = require('brkontru'),
  buttons = [new bot.Button(bot.pins.p9_23), new bot.Button(bot.pins.p9_24)];

buttons.forEach(function (button) {
  button.on('error', function (err) {
    console.log('error: ' + button.name + err);
  });
  button.on('pressed', function () {
    console.log('pressed: ' + button.name);
  });
  button.on('released', function () {
    console.log('released: ' + button.name);
  });
});
```

