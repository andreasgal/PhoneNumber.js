# PhoneNumber.js


PhoneNumber.js is a JavaScript library to verify and format phone numbers.
It is similar in purpose to Google's libphonenumber library, with the main difference
that Google's code is some incredibly ugly spaghetti code that was cross-compiled
from Java and uses around 10MB of memory.

PhoneNumber.js uses libphonenumber's PhoneNumberMetaData.xml database of known
phone number formats. Use "make" to download the xml file and translate it
into PhoneNumber.js's internal format.
