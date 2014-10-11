## brkontru - Break On Through (To The Other Side!)

ADC, GPIO, PWM, UARTs, and more on the BeagleBone Black.

## Installation

    $ npm install brkontru

Tested with Debian Image 2014-09-03 and Node.js v0.10.25 on a BeagleBone Black
rev. A5C.

## Features

 * LEDs - Light Emitting Diodes
 * Buttons and Switches
 * ADC - Analog to Digital Conversion
 * GPIO - General Purpose Input Output
 * PWM - Pulse Width Modulation
 * UART - Serial Communication

## Usage

### LEDs

Let's start off with something simple that doesn't require any hadrware other
than the BeagleBone Black itself. The following example will blink onboard user
LED0 at a frequency of 1Hz.

```js
var bot = require('brkontru'),
  usr0 = new bot.Led(bot.Led.USR0);

usr0.once('ready', function () {
  // Blink at 1Hz. Cycle = 1000ms, on for 500ms, off for 500ms.
  usr0.blink();
});
```

The next example blinks all four onboard user LEDs at 100Hz. Every 250ms the
blink delays are adjusted. The LEDs will alternate between glowing dimly and
brightly.

```js
var bot = require('brkontru'),
  Led = bot.Led,
  leds;

leds = [Led.USR0, Led.USR1, Led.USR2, Led.USR3].map(function(usrledName) {
  return new Led(usrledName);
});

bot.once('ready', leds, function () {
  var blinkLeds = function (delayOn, delayOff) {
    leds.forEach(function (led) {
      led.blink(delayOn, delayOff);
    });
  };

  setInterval(function () {
    // Blink at 100Hz. Cycle = 10ms, on for 1ms, off for 9ms.
    blinkLeds(1, 9);
    setTimeout(function () {
      // Blink at 100Hz. Cycle = 10ms, on for 9ms, off for 1ms.
      blinkLeds(9, 1);
    }, 250);
  }, 500);
});
```

### Buttons

Toggle the state of an LED every time a button is pressed.

<img src="https://github.com/fivdi/brkontru/raw/master/example/button-and-led.png">

```js
var bot = require('brkontru'),
  button = new bot.Button(bot.pins.p9_24),
  led = new bot.Led(bot.pins.p9_26),
  ledState = 0;

button.on('pressed', function () {
  led.value(ledState ^= 1);
});
```

### PWM - Pulse Width Modulation

Fade an LED on and off once per second.

<img src="https://github.com/fivdi/brkontru/raw/master/example/pwm.png">

```js
var bot = require('brkontru'),
  led = new bot.Pwm(bot.pins.p9_42);

led.once('ready', function () {
  var period = led.period();
  var duty = 0;
  var delta = period / 50;

  (function updateDuty() {
    led.duty(duty);

    duty += delta;

    if (duty < 0 || duty > period) {
      delta = -delta;
      duty += delta;
    }

    setTimeout(updateDuty, 10);
  })();
});
```

### ADC - Analog to Digital Conversion

Determine the ambient light level with an analog ambient light sensor.

<img src="https://github.com/fivdi/brkontru/raw/master/example/adc.png">

```js
var bot = require('brkontru'),
  ain = new bot.Ain(bot.pins.p9_36);

ain.once('ready', function () {
  setInterval(function () {
    console.log(ain.rawValue());
  }, 1000);
});

```

## Documentation

### Classes

- [Ain](https://github.com/fivdi/brkontru/blob/master/doc/ain.md) - Analog to Digital Conversion
- [Button](https://github.com/fivdi/brkontru/blob/master/doc/button.md) - Buttons and Switches
- [Gpio](https://github.com/fivdi/brkontru/blob/master/doc/gpio.md) - General Purpose Input Output
- [Led](https://github.com/fivdi/brkontru/blob/master/doc/led.md) - Light Emitting Diodes
- [Pwm](https://github.com/fivdi/brkontru/blob/master/doc/pwm.md) - Pulse Width Modulation
- [Uart](https://github.com/fivdi/brkontru/blob/master/doc/uart.md) - Serial Communication

### Objects

- [pins](https://github.com/fivdi/brkontru/blob/master/doc/pins.md) - Header Pins
- [pullTypes](https://github.com/fivdi/brkontru/blob/master/doc/pulltypes.md) - Pull Type Constants

### Functions

- [once](https://github.com/fivdi/brkontru/blob/master/doc/once.md) - One Time Listener

