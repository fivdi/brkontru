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

# LEDs

Let's start off with something simple that doesn't require any hadrware other
than the BeagleBone Black itself. The following program will blink user LED0
at a frequency of 1HZ.

```js
var bot = require('brkontru'),
  usr0 = new bot.Led(bot.Led.USR0);

usr0.once('ready', function () {
  // Blink at 1Hz. Cycle = 1000ms, on for 100ms, off for 900ms.
  usr0.blink(100, 900);
});
```

The next example blinks all four onboard user LEDs at 100Hz. Every 250ms the
on/off blink delays are adjusted. The LEDs will apternate between glowing dimly
and the brightly.

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
      blinkLeds(10, 0);
    }, 250);
  }, 500);
});
```


