## brkontru - Break On Through (To The Other Side!)

Easy access to the BeagleBone Black GPIO expansion headers.

Currently supports the following features:

 * GPIO - General Purpose Input Output
 * PWM - Pulse Width Modulation
 * ADC - Analog to Digital Conversion
 * LEDs - Light Emitting Diodes
 * Buttons and Switches

Work in progress!

## Installation

    $ npm install brkontru

Tested with Debian Image 2014-05-14 and Node.js v0.10.25 on a BeagleBone Black
rev. A5C.

## Usage

Let's start off with something simple that doesn't require any hadrware other
than the BeagleBone Black itself.

```js
var bot = require('brkontru'),
  usr0 = new bot.Led(bot.Led.USR0);

usr0.once('ready', function () {
  // Blink at 1Hz. Cycle = 1000ms, on for 500ms, off for 500ms.
  usr0.blink();
});
```

This will blink onboard user LED0 at a frequency of 1Hz. The Led#blink method
has two arguments; delayOn and delayOff, both in milliseconds. If unspecified,
they default to 500ms. The next example also blinks the LED at a frequency of
1Hz, but this time the on and off delays are explicitly specified.

```js
var bot = require('brkontru'),
  usr0 = new bot.Led(bot.Led.USR0);

usr0.once('ready', function () {
  // Blink at 1Hz. Cycle = 1000ms, on for 100ms, off for 900ms.
  usr0.blink(100, 900);
});
```

It's also possible to blink the LED faster, say at 100Hz. The following
example will do just that. The blinking will no longer be visible as it's too
fast for the eye to detect and the LED will light dimly as it's only on 10% of
the time.

```js
var bot = require('brkontru'),
  usr0 = new bot.Led(bot.Led.USR0);

usr0.once('ready', function () {
  // Blink at 100Hz. Cycle = 10ms, on for 1ms, off for 9ms.
  usr0.blink(1, 9);
});
```

To have the LED glow at almost full brightness:

```js
var bot = require('brkontru'),
  usr0 = new bot.Led(bot.Led.USR0);

usr0.once('ready', function () {
  // Blink at 100Hz. Cycle = 10ms, on for 9ms, off for 1ms.
  usr0.blink(9, 1);
});
```

The next example blinks all four onboard user LEDs at 100Hz. Every 250ms, the
LEDs change from glowing dimly to glowing brightly.

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
    blinkLeds(1, 9);
    setTimeout(function () {
      blinkLeds(10, 0);
    }, 250);
  }, 500);
});
```


