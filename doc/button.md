## Class Button - Buttons and Switches

The following circuit shows how to wire a button to pin 24 on the P9 header.

<img src="https://github.com/fivdi/brkontru/raw/master/doc/button.png">

The program below can be used with this circuit to print information every
time the button is pressed or released.

```js
var bot = require('brkontru'),
  button = new bot.Button(bot.pins.p9_24),
  pressd = 0,
  released = 0;

function printInfo() {
  console.log('pressed: ' + pressed + ', released: ' + 'released');
}

button.on('pressed', function () {
  pressed += 1;
  printInfo();
});

button.on('released', function () {
  released += 1;
  printInfo();
});
```

### Constructor: Button(pin, options)
- pin - a pin object
- options - object (optional)

Creates a Button object which will fire events when the corresponding button is
pressed or released. A Button object is an EventEmitter.

The following options are supported:
- debounceInterval: number (optional, default 50)
- pullType: number (optional, pullTypes.PULL_UP)
- isActiveLow - boolean (optional, default true)

### Event: 'ready'
Emitted after the constructor has completed creation of the Button object
indicating that the object is now ready for usage.

### Event: 'pressed'
Emitted when the button is pressed.

### Event: 'released'
Emitted when the button is released.

### Event: 'error'
Emitted on error.

