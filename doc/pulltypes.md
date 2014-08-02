## pullTypes - Pull Type Constants

When creating some object types, for example, Buttons or Gpios, it's optionally
possible to specify whether or not the internal pull-up or pull-down resistors
should be enabled on the corresponding pin. The pullTypes object has three
constants for specifying the pull type in such cases.

```js
var bot = require('brkontru'),
  button = new bot.Gpio(bot.pins.p9_23, {
    direction: bot.Gpio.IN,
    pullType: pullTypes.PULL_UP
  });
```

### Constant: pullTypes.NONE
Niether the pull-up nor the pull-down resistor should be enabled.

### Constant: pullTypes.PULL_UP
Enable pull-up resistor.

### Constant: pullTypes.PULL_DOWN
Enable pull-down resistor.

