# PhoneNumber.js


PhoneNumber.js is a JavaScript library to verify and format phone numbers.
It is similar in purpose to Google's libphonenumber library, with the main difference
that Google's code is some incredibly ugly spaghetti code that was cross-compiled
from Java and uses around 10MB of memory. We intend to use PhoneNumber.js in
Firefox OS, Mozilla's Web-based smartphone operating system, and we don't have
10MB to waste.

PhoneNumber.js uses libphonenumber's PhoneNumberMetaData.xml database of known
phone number formats. Use "make" to download the xml file and translate it
into PhoneNumber.js's internal format.
