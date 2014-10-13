## Gpio Class - General Purpose Input Output

The following circuit shows how to wire a button to pin 24 and an LED to pin
26 on the P9 header. When the button is pressed, P9_24 will be pulled low.
When it's released, P9_24 will be pulled high as the internal pull-up resistor
for P9_24 will be enabled.

<img src="https://github.com/fivdi/brkontru/raw/master/example/button-and-led.png">

The program below can be used with this circuit. When the button is pressed,
the LED will turn on, when it's released, the LED will turn off.

```js
var bot = require('brkontru'),
  button = new bot.Gpio(bot.pins.p9_24, {
    direction: bot.Gpio.IN,
    pullType: bot.pullTypes.PULL_UP
  }),
  led = new bot.Gpio(bot.pins.p9_26);

bot.once('ready', [button, led], function () {
  setInterval(function() {
    led.value(button.value() ^ 1);
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

### Method: direction(value)
- value - Gpio.IN or Gpio.OUT (optional)

Returns the current direction of the GPIO if no value is specified, else sets
the direction to the specified value.

### Method: edge(value)
- value - Gpio.NONE, Gpio.FALLING, Gpio.RISING, or Gpio.BOTH (optional)

Returns the current interrupting edge for the GPIO if no value is specified,
else sets the interrupting edge to the specified value.

### Method: pullType(value)
- value - one of the pullTypes constants (optional)

GPIO pins have internal pull-up and pull-down resistors that can be enabled.
Returns the current pullType if no value is specified, else sets the pullType
to the specified value. 
See [pullTypes](https://github.com/fivdi/brkontru/blob/master/doc/pulltypes.md).

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

