/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

load("PhoneNumber.js");

function Test(currentRegion, dial, region, number, nationalFormat, internationalFormat) {
  var phoneNumber = PhoneNumber.Parse(dial, currentRegion);
  if (phoneNumber.region != region ||
      phoneNumber.number != number ||
      phoneNumber.nationalFormat != nationalFormat ||
      phoneNumber.internationalFormat != internationalFormat) {
    print("expected: " + number + " " + region + " " + nationalFormat + " " + internationalFormat);
    print("got: " + phoneNumber.number + " " + phoneNumber.region + " " + phoneNumber.nationalFormat + " " + phoneNumber.internationalFormat);
  }
}

// Try a couple german numbers from the US with various access codes.
Test("US", "49451491934", "DE", "451491934", "0451 491934", "+49 451 491934");
Test("US", "+49451491934", "DE", "451491934", "0451 491934", "+49 451 491934");
Test("US", "01149451491934", "DE", "451491934", "0451 491934", "+49 451 491934");

// Now try dialing the same number from within the German region.
Test("DE", "451491934", "DE", "451491934", "0451 491934", "+49 451 491934");
Test("DE", "0451491934", "DE", "451491934", "0451 491934", "+49 451 491934");
