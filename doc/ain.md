## Ain Class - Analog to Digital Conversion

### Constructor: Ain(pin, options)
- pin - an analog capable pin object
- options - object (optional)

Creates an Ain (analog input) object for reading the value from an analog
capable input pin.

The following options are supported:
- vsenseScale: number (optional, default 100)

### Method: rawValue()
Returns the raw value of the analog input pin.

### Event: 'ready'
Emitted after the constructor has completed creation of the Ain object
indicating that the object is now ready for usage.

### Event: 'error'
Emitted on error.

