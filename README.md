# PhoneNumber.js


PhoneNumber.js is a JavaScript library to verify and format phone numbers.
It is similar in purpose to Google's libphonenumber library, with the main difference
that Google's code is some incredibly ugly spaghetti code that was cross-compiled
from Java and uses around 10MB of memory.

The memory use of PhoneNumber.js starts around 60k and increases as region meta data
is unpacked. Depending on the memory layout of the specific JavaScript engine, peak
memory use should be below 200k. If you mostly format numbers from one or a few
regions, memory use should be pretty close to 60k.

PhoneNumber.js uses libphonenumber's PhoneNumberMetadata.xml database of known
phone number formats. Use "grunt" to download the xml file and translate it
into PhoneNumber.js's internal format.

## Installation

PhoneNumber.js requires [grunt-cli](http://gruntjs.com/) to be installed in your system.
If you do not have it yet, install it from [npm](https://npmjs.org/package/grunt-cli):

    npm install -g grunt-cli

Install dependencies and run grunt:

    npm install
    grunt

If you want to update PhoneNumberMetadata.js, just run:

    grunt

# Copyright and license

PhoneNumber.js was written by Andreas Gal <gal@mozilla.com> as part of Mozilla's
Firefox OS (Boot to Gecko) project and is licensed under the Apache License, Version 2.0.


