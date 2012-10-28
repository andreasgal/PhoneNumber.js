/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

load("PhoneNumberMetaData.js");
load("PhoneNumber.js");

function Parse(dial, currentRegion) {
  var result = PhoneNumber.Parse(dial, currentRegion);
  if (!result) {
    print("expected: parses");
    print("got: " + dial + " " + currentRegion);
  }
  return result;
}

function Test(dial, currentRegion, number, region) {
  var result = Parse(dial, currentRegion);
  if (result.region != region || result.number != number) {
    print("expected: " + number + " " + region);
    print("got: " + result.number + " " + result.region);
  }
  return result;
}

function Format(dial, currentRegion, number, region, nationalFormat, internationalFormat) {
  var result = Test(dial, currentRegion, number, region);
  if (result.nationalFormat != nationalFormat ||
      result.internationalFormat != internationalFormat) {
    print("expected: " + nationalFormat + " " + internationalFormat);
    print("got: " + result.nationalFormat + " " + result.internationalFormat);
    return result;
  }
}

// Test parsing national numbers.
Parse("033316005", "NZ");
Parse("03-331 6005", "NZ");
Parse("03 331 6005", "NZ");
// Testing international prefixes.
// Should strip country code.
Parse("0064 3 331 6005", "NZ");
// Try again, but this time we have an international number with region rode US. It should
// recognize the country code and parse accordingly.
Parse("01164 3 331 6005", "US");
Parse("+64 3 331 6005", "US");
Parse("64(0)64123456", "NZ");
// Check that using a "/" is fine in a phone number.
Parse("123/45678", "DE");
Parse("123-456-7890", "US");

// Test parsing international numbers.
Parse("+1 (650) 333-6000", "NZ");
Parse("1-650-333-6000", "US");
// Calling the US number from Singapore by using different service providers
// 1st test: calling using SingTel IDD service (IDD is 001)
Parse("0011-650-333-6000", "SG");
// 2nd test: calling using StarHub IDD service (IDD is 008)
Parse("0081-650-333-6000", "SG");
// 3rd test: calling using SingTel V019 service (IDD is 019)
Parse("0191-650-333-6000", "SG");
// Calling the US number from Poland
Parse("0~01-650-333-6000", "PL");
// Using "++" at the start.
Parse("++1 (650) 333-6000", "PL");
// Using a full-width plus sign.
Parse("\uFF0B1 (650) 333-6000", "SG");
// The whole number, including punctuation, is here represented in full-width form.
Parse("\uFF0B\uFF11\u3000\uFF08\uFF16\uFF15\uFF10\uFF09" +
      "\u3000\uFF13\uFF13\uFF13\uFF0D\uFF16\uFF10\uFF10\uFF10",
      "SG");

// Try a couple german numbers from the US with various access codes.
Format("49451491934", "US", "451491934", "DE", "0451 491934", "+49 451 491934");
Format("+49451491934", "US", "451491934", "DE", "0451 491934", "+49 451 491934");
Format("01149451491934", "US", "451491934", "DE", "0451 491934", "+49 451 491934");

// Now try dialing the same number from within the German region.
Format("451491934", "DE", "451491934", "DE", "0451 491934", "+49 451 491934");
Format("0451491934", "DE", "451491934", "DE", "0451 491934", "+49 451 491934");
