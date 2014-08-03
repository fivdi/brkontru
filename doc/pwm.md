## Class Pwm - Pulse Width Modulation

### Constructor: Pwm(pin, options)
- pin - a pin object
- options - object (optional)

Creates a Pwm object for controlling a PWM capable output pin. The period and
duty properties of the options object can be used to configure PWM switching
frequency and duty cycle. Additional options are available for configuring the
PWM polarity and whether or not the PWM signal is initially enabled.

The following options are supported:
- period: number (optional, default 500000 nanoseconds)
- duty: number (optional, default 0 nanoseconds)
- enabled: boolean (optional, default true)
- polarity - number (optional, default Pwm.LOW)

### Method: period(value)
- value - number (optional)

Returns the current period if no value is specified, else sets period to the
specified value. The unit for period is nanoseconds.

Under the covers, PWM capables pins are organized by the hardware into modules.
If two PWM pins from the same module are used, they both must be configured
with the same period and the period can't be modified after it has been
configured.

Module | Pins
:---: | :---:
ehrpwm0 | P9_21, P9_22
ehrpwm1 | P9_14, P9_16
ehrpwm2 | P8_13, P9_19
ecap0 | P9_42

var pwmPins = {
  p8_13: {subSystem: 2, module: 'ehrpwm2', channel: 1, muxMode: 4, mux: 'ehrpwm2B'},
  p8_19: {subSystem: 2, module: 'ehrpwm2', channel: 0, muxMode: 4, mux: 'ehrpwm2A'},
  p9_14: {subSystem: 1, module: 'ehrpwm1', channel: 0, muxMode: 6, mux: 'ehrpwm1A'},
  p9_16: {subSystem: 1, module: 'ehrpwm1', channel: 1, muxMode: 6, mux: 'ehrpwm1B'},
  p9_21: {subSystem: 0, module: 'ehrpwm0', channel: 1, muxMode: 3, mux: 'ehrpwm0B'},
  p9_22: {subSystem: 0, module: 'ehrpwm0', channel: 0, muxMode: 3, mux: 'ehrpwm0A'},
  p9_42: {subSystem: 0, module: 'ecap0',   channel: 0, muxMode: 0, mux: 'eCAP0_in_PWM0_out'}
};

### Method: duty(value)
- value - number (optional)

Returns the current duty if no value is specified, else sets duty to the
specified value. The unit for period is nanoseconds.

### Method: enabled(value)
- value - boolean (optional)

Returns a boolean specifying whether or not the PWM is enabled, if no value is
specified, else enables or disables the PWM depending on the value specified.

### Method: polarity(value)
- value - number (optional, Pwm.LOW or Pwm.HIGH)

Returns Pwm.LOW or Pwm.HIGH specifying the polarity of the PWM, if no value is
specified, else sets the polarity to the specified value.

### Event: 'ready'
Emitted after the constructor has completed creation of the Pwm object
indicating that the object is now ready for usage.

### Event: 'error'
Emitted on error.

