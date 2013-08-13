/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

load("PhoneNumberMetaData.js");
load("PhoneNumberNormalizer.js");
load("PhoneNumber.js");

let gCountryList;

function TestProperties(dial, currentRegion) {
  print("test: " + dial + ", " + currentRegion);
  var result = PhoneNumber.Parse(dial, currentRegion);
  if (result) {
    var tmp = result.internationalFormat;
    tmp = result.internationalNumber;
    tmp = result.nationalNumber;
    tmp = result.nationalFormat;
  } else {
  }
}

function makeid(maxSize)
{
  var text = "";
  var possible = "0123456789";
  var length = Math.floor(Math.random() * maxSize);
  for (var i=0; i < length; i++ )
    text += (possible.charAt(Math.floor(Math.random() * possible.length)));

  return text;
}

function getRandomCC() {
  if (gCountryList) {
    return gCountryList[Math.floor(Math.random() * gCountryList.length)];
  }

  gCountryList = [];
  for (let id in PHONE_NUMBER_META_DATA) {
    let obj = PHONE_NUMBER_META_DATA[id];
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        let cc = obj[i].substring(2,4);
        if (cc != "00")
          gCountryList.push(cc);
      }
    } else {
      let cc = obj.substring(2,4);
      if (cc != "00")
        gCountryList.push(cc);
    }
  }
  return gCountryList[Math.floor(Math.random() * gCountryList.length)];
}

for (var i = 0; i < 100000; i++) {
  let dial = makeid(15);
  if (i % 3 == 0) {
    let x = Math.floor(Math.random() * 3);
    switch (x) {
      case 0:
        dial = ("+" + dial);
      break;
      case 1:
        dial = ("+0" + dial);
      break;
      case 2:
        dial = ("0" + dial);
      break;
    }
  }
  
  TestProperties(dial, getRandomCC());
}
