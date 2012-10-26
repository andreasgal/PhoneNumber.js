/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

load("PhoneNumber.js");

function National(currentRegion, number, expected) {
  var expectedRegion = expected.substr(0, 2);
  var expectedNationalNumber = expected.substr(2);
  var parsed = PhoneNumber.Parse(number, currentRegion);
  if (parsed.region.region != expectedRegion ||
      parsed.nationalNumber != expectedNationalNumber) {
    print("got: " + parsed.region.region + "/" + parsed.nationalNumber + " " +
          "expected: " + expectedRegion + "/" + expectedNationalNumber);
  }
}

National("US", "49451491934", "DE451491934");
National("US", "+49451491934", "DE451491934");
National("US", "01149451491934", "DE451491934");
