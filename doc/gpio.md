## Gpio Class - General Purpose Input Output

The program below uses two GPIOs. One as an input to sense the state of a
button and one as an output to control an LED. When the button is pressed, the
LED will turn on, when it's released, the LED will turn off.

```js
var bot = require('brkontru'),
  button = new bot.Gpio(bot.pins.p9_23, {
    direction: bot.Gpio.IN,
    pullType: bot.pullTypes.PULL_UP
  }),
  led = new bot.Gpio(bot.pins.p9_26);

bot.once('ready', [button, led], function () {
  setInterval(function() {
    led.value(button.value());
  }, 20);
});
```

### Constructor: Gpio(pin, options)
- pin - a pin object
- options - object (optional)

Creates a Gpio object for controlling a GPIO header pin. The options object
can be used to configure the direction and pull type for the GPIO. A Gpio
object is an EventEmitter.

The following options are supported:
- direction - string (optional, default Gpio.OUT)
- pullType: number (optional, default pullTypes.NONE)

### Method: value(val)
- val - number (optional, 0 or 1 if specified)

Returns the current value of the GPIO if no val is specified, else sets the
value to the specified val.

### Event: 'ready'
Emitted after the constructor has completed creation of the Gpio object
indicating that the object is now ready for usage.

### Event: 'error'
Emitted on error.

### Constant: Gpio.IN
Passed to the constructor as the direction option in the options object to
configure the GPIO as an input.

### Constant: Gpio.OUT
Passed to the constructor as the direction option in the options object to
configure the GPIO as an output.

### Constant: Gpio.OUT_HIGH
Passed to the constructor as the direction option in the options object to
configure the GPIO as an output. Sets the output high.

### Constant: Gpio.OUT_LOW
Passed to the constructor as the direction option in the options object to
configure the GPIO as an output. Sets the output low.

