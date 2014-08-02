## LED - Light Emitting Diode

### Constructor: Led(pin, options)
- pin - a pin object or one of Led.USR0, Led.USR1, Led.USR2, or Led.USR3
- options - object (optional)

Creates an Led object for controlling an LED. The LED can be either one of the
four onboard user LEDs or an LED connected up to an appropriate header pin.

The following options are supported:
- isActiveLow - boolean (optional, default false)

### Method: value(val)
- val - number

Turn the LED on or off. val should be Led.ON or Led.OFF.

### Method: blink(delayOn, delayOff)
- delayOn - number (optional, default 500)
- delayOff - number (optional, default 500)

Flash the LED at a fixed rate. delayOn and delayOff specify the on and off time
in milliseconds. If delayOn or delayOff is not specified, it will default to
500 milliseconds.

### Method: heartbeat()
Double flash the LED like an actual heart beat (thump-thump-pause.)

### Method: cpu()
Flash the LED to indicate CPU activity.

### Event: 'ready'
Emitted after the constructor has created the Led object to indicate that the
object is now ready for usage.

### Event: 'error'
Emitted on error.

### Constant: Led.USR0
Passed to the constructor to control user LED0.

### Constant: Led.USR1
Passed to the constructor to control user LED1.

### Constant: Led.USR2
Passed to the constructor to control user LED2.

### Constant: Led.USR3
Passed to the constructor to control user LED3.

### Constant: Led.ON
Passed to the value method to turn the LED on.

### Constant: Led.OFF
Passed to the value method to turn the LED off.

