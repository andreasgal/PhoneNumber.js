
/* global PhoneNumber: false, PhoneNumberNormalizer: false */ 
/* global test: false, equal: false, ok: false, deepEqual: false */

module("Is Plain");

// Test whether could a string be a phone number.
test("IsPlain", function() {
    equal(PhoneNumber.IsPlain(null), false);
    equal(PhoneNumber.IsPlain(""), false);
    equal(PhoneNumber.IsPlain("1"), true);
    equal(PhoneNumber.IsPlain("*2"), true); // Real number used in Venezuela
    equal(PhoneNumber.IsPlain("*8"), true); // Real number used in Venezuela
    equal(PhoneNumber.IsPlain("12"), true);
    equal(PhoneNumber.IsPlain("123"), true);
    equal(PhoneNumber.IsPlain("1a2"), false);
    equal(PhoneNumber.IsPlain("12a"), false);
    equal(PhoneNumber.IsPlain("1234"), true);
    equal(PhoneNumber.IsPlain("123a"), false);
    equal(PhoneNumber.IsPlain("+"), true);
    equal(PhoneNumber.IsPlain("+1"), true);
    equal(PhoneNumber.IsPlain("+12"), true);
    equal(PhoneNumber.IsPlain("+123"), true);
    equal(PhoneNumber.IsPlain("()123"), false);
    equal(PhoneNumber.IsPlain("(1)23"), false);
    equal(PhoneNumber.IsPlain("(12)3"), false);
    equal(PhoneNumber.IsPlain("(123)"), false);
    equal(PhoneNumber.IsPlain("(123)4"), false);
    equal(PhoneNumber.IsPlain("(123)4"), false);
    equal(PhoneNumber.IsPlain("123;ext="), false);
    equal(PhoneNumber.IsPlain("123;ext=1"), false);
    equal(PhoneNumber.IsPlain("123;ext=1234567"), false);
    equal(PhoneNumber.IsPlain("123;ext=12345678"), false);
    equal(PhoneNumber.IsPlain("123 ext:1"), false);
    equal(PhoneNumber.IsPlain("123 ext:1#"), false);
    equal(PhoneNumber.IsPlain("123-1#"), false);
    equal(PhoneNumber.IsPlain("123 1#"), false);
    equal(PhoneNumber.IsPlain("123 12345#"), false);
    equal(PhoneNumber.IsPlain("123 +123456#"), false);
});

module("Properties");

// Getting international number back from intl number.
test("Properties", function(){
    var result = PhoneNumber.Parse("+13442074");
    ok("internationalFormat" in result);
    ok("internationalNumber" in result);
    ok("nationalNumber" in result);
    ok("nationalFormat" in result);
});

module("Parse");

// Test parsing national numbers.
test("National numbers", function(){
    ok(PhoneNumber.Parse("033316005", "NZ"));
    ok(PhoneNumber.Parse("03-331 6005", "NZ"));
    ok(PhoneNumber.Parse("03 331 6005", "NZ"));
});

// Testing international prefixes.
// Should strip country code.
test("National numbers with international prefixes", function(){
    ok(PhoneNumber.Parse("0064 3 331 6005", "NZ"));
});

// Test CA before US because CA has to import meta-information for US.
test("CA", function(){
    ok(PhoneNumber.Parse("4031234567", "CA"));
    ok(PhoneNumber.Parse("(416) 585-4319", "CA"));
    ok(PhoneNumber.Parse("647-967-4357", "CA"));
    ok(PhoneNumber.Parse("416-716-8768", "CA"));
    ok(PhoneNumber.Parse("18002684646", "CA"));
    ok(PhoneNumber.Parse("416-445-9119", "CA"));
    ok(PhoneNumber.Parse("1-800-668-6866", "CA"));
    ok(PhoneNumber.Parse("(416) 453-6486", "CA"));
    ok(PhoneNumber.Parse("(647) 268-4778", "CA"));
    ok(PhoneNumber.Parse("647-218-1313", "CA"));
    ok(PhoneNumber.Parse("+1 647-209-4642", "CA"));
    ok(PhoneNumber.Parse("416-559-0133", "CA"));
    ok(PhoneNumber.Parse("+1 647-639-4118", "CA"));
    ok(PhoneNumber.Parse("+12898803664", "CA"));
    ok(PhoneNumber.Parse("780-901-4687", "CA"));
    ok(PhoneNumber.Parse("+14167070550", "CA"));
    ok(PhoneNumber.Parse("+1-647-522-6487", "CA"));
    ok(PhoneNumber.Parse("(416) 877-0880", "CA"));
});

// Try again, but this time we have an international number with region rode US. It should
// recognize the country code and parse accordingly.
test("International number with region code", function(){
    ok(PhoneNumber.Parse("01164 3 331 6005", "US"));
    ok(PhoneNumber.Parse("+64 3 331 6005", "US"));
    ok(PhoneNumber.Parse("64(0)64123456", "NZ"));
});

// Check that using a "/" is fine in a phone number.
test("Slash and hyphen should be fine in a phone number", function(){
    ok(PhoneNumber.Parse("123/45678", "DE"));
    ok(PhoneNumber.Parse("123-456-7890", "US"));
});

// Test parsing international numbers.
test("Parse international numbers", function(){
    ok(PhoneNumber.Parse("+1 (650) 333-6000", "NZ"));
    ok(PhoneNumber.Parse("1-650-333-6000", "US"));
});

// Calling the US number from Singapore by using different service providers
// 1st test: calling using SingTel IDD service (IDD is 001)
test("SingTel IDD service", function(){
    ok(PhoneNumber.Parse("0011-650-333-6000", "SG"));
});

// 2nd test: calling using StarHub IDD service (IDD is 008)
test("StarHub IDD service", function(){
    ok(PhoneNumber.Parse("0081-650-333-6000", "SG"));
});

// 3rd test: calling using SingTel V019 service (IDD is 019)
test("SingTel V019 service", function(){
    ok(PhoneNumber.Parse("0191-650-333-6000", "SG"));
});

// Calling the US number from Poland
test("From US to Poland using 0", function(){
    ok(PhoneNumber.Parse("0~01-650-333-6000", "PL"));
});

// Using "++" at the start.
test("From US to Poland using ++", function(){
    ok(PhoneNumber.Parse("++1 (650) 333-6000", "PL"));
});

// Using a full-width plus sign.
test("Use a full-width plus sign ＋", function(){
    ok(PhoneNumber.Parse("\uFF0B1 (650) 333-6000", "SG"));
});

// The whole number, including punctuation, is here represented in full-width form.
test("Use full-width punctuation", function(){
    ok(PhoneNumber.Parse("\uFF0B\uFF11\u3000\uFF08\uFF16\uFF15\uFF10\uFF09" +
        "\u3000\uFF13\uFF13\uFF13\uFF0D\uFF16\uFF10\uFF10\uFF10",
        "SG"));
});

// Test parsing with leading zeros.
test("Parse leading zeros", function(){
    ok(PhoneNumber.Parse("+39 02-36618 300", "NZ"));
    ok(PhoneNumber.Parse("02-36618 300", "IT"));
    ok(PhoneNumber.Parse("312 345 678", "IT"));
});

// Test parsing numbers in Argentina.
test("AR", function(){
    ok(PhoneNumber.Parse("+54 9 343 555 1212", "AR"));
    ok(PhoneNumber.Parse("0343 15 555 1212", "AR"));
    ok(PhoneNumber.Parse("+54 9 3715 65 4320", "AR"));
    ok(PhoneNumber.Parse("03715 15 65 4320", "AR"));
    ok(PhoneNumber.Parse("+54 11 3797 0000", "AR"));
    ok(PhoneNumber.Parse("011 3797 0000", "AR"));
    ok(PhoneNumber.Parse("+54 3715 65 4321", "AR"));
    ok(PhoneNumber.Parse("03715 65 4321", "AR"));
    ok(PhoneNumber.Parse("+54 23 1234 0000", "AR"));
    ok(PhoneNumber.Parse("023 1234 0000", "AR"));
});

// Test numbers in Mexico
test("MX", function(){
    ok(PhoneNumber.Parse("+52 (449)978-0001", "MX"));
    ok(PhoneNumber.Parse("01 (449)978-0001", "MX"));
    ok(PhoneNumber.Parse("(449)978-0001", "MX"));
    ok(PhoneNumber.Parse("+52 1 33 1234-5678", "MX"));
    ok(PhoneNumber.Parse("044 (33) 1234-5678", "MX"));
    ok(PhoneNumber.Parse("045 33 1234-5678", "MX"));
});

// Test that lots of spaces are ok.
test("Allow lots of spaces", function(){
    ok(PhoneNumber.Parse("0 3   3 3 1   6 0 0 5", "NZ"));
});

// Test omitting the current region. This is only valid when the number starts
// with a '+'.
test("Allow omitting the current region", function(){
    ok(PhoneNumber.Parse("+64 3 331 6005"));
    ok(PhoneNumber.Parse("+64 3 331 6005", null));
});

module("Format", {
    testFormat: function(dial, currentRegion, nationalNumber, region, nationalFormat, internationalFormat){
        var expected = {
                nationalNumber: nationalNumber,
                region: region,
                nationalFormat: nationalFormat,
                internationalFormat: internationalFormat
            },

            parsed = PhoneNumber.Parse(dial, currentRegion),

            formatted = {
                nationalNumber: parsed.nationalNumber,
                region: parsed.region,
                nationalFormat: parsed.nationalFormat,
                internationalFormat: parsed.internationalFormat
            };

        deepEqual(formatted, expected);
    }
});

// US numbers
test("US numbers", function(){
    this.testFormat("19497261234", "US", "9497261234", "US", "(949) 726-1234", "+1 949-726-1234");
});

// Try a couple german numbers from the US with various access codes.
test("DE numbers from the US", function(){
    this.testFormat("49451491934", "US", "451491934", "DE", "0451 491934", "+49 451 491934");
    this.testFormat("+49451491934", "US", "451491934", "DE", "0451 491934", "+49 451 491934");
    this.testFormat("01149451491934", "US", "451491934", "DE", "0451 491934", "+49 451 491934");
});

// Now try dialing the same number from within the German region.
test("DE numbers from DE", function(){
    this.testFormat("451491934", "DE", "451491934", "DE", "0451 491934", "+49 451 491934");
    this.testFormat("0451491934", "DE", "451491934", "DE", "0451 491934", "+49 451 491934");
});

// Numbers in italy keep the leading 0 in the city code when dialing internationally.
test("IT numbers", function(){
    this.testFormat("0577-555-555", "IT", "0577555555", "IT", "05 7755 5555", "+39 05 7755 5555");
});

// Colombian international number without the leading "+"
test("CO numbers without leading +", function(){
    this.testFormat("5712234567", "CO", "12234567", "CO", "(1) 2234567", "+57 1 2234567");
});

// Telefonica tests
test("Telefonica", function(){
    this.testFormat("612123123", "ES", "612123123", "ES", "612 12 31 23", "+34 612 12 31 23");
});

// Chile mobile number from a landline
test("Chile mobile from a landline", function(){
    this.testFormat("0997654321", "CL", "997654321", "CL", "(99) 765 4321", "+56 99 765 4321");
});

// Chile mobile number from another mobile number
test("Chile mobile from another mobile", function(){
    this.testFormat("997654321", "CL", "997654321", "CL", "(99) 765 4321", "+56 99 765 4321");
});

// China mobile number with a 0 in it
test("China mobile number with a 0 in it", function(){
    this.testFormat("15955042864", "CN", "15955042864", "CN", "0159 5504 2864", "+86 159 5504 2864");
});

module("Can't parse");

test("Special numbers", function(){
    // Dialing 911 in the US. This is not a national number.
    ok(!PhoneNumber.Parse("911", "US"));
    // Dialing 112 in EE. This is not a national number.
    ok(!PhoneNumber.Parse("112", "EE"));
});

module("Normalize");

// Test normalizing numbers. Only 0-9,#* are valid in a phone number.
test("Test normalizing numbers", function(){
    equal(PhoneNumberNormalizer.Normalize("+ABC # * , 9 _ 1 _0"), "+222#*,910");
    equal(PhoneNumberNormalizer.Normalize("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), "22233344455566677778889999");
    equal(PhoneNumberNormalizer.Normalize("abcdefghijklmnopqrstuvwxyz"), "22233344455566677778889999");
});

// Normalize with numbersOnly property
test("Normalize with numbersOnly property", function(){
    equal(PhoneNumberNormalizer.Normalize("123abc", true), "123");
    equal(PhoneNumberNormalizer.Normalize("12345", true), "12345");
    equal(PhoneNumberNormalizer.Normalize("1abcd", false), "12223");
});

module("All Equal", {
    testList: function(list, region, nationalFormat){
        for(var i=0; i < list.length; i++){
            equal(PhoneNumber.Parse(list[i], region).nationalFormat, nationalFormat);
        }
    }
});

// 8 and 9 digit numbers with area code in Brazil with collect call prefix (90)
test("BR numbers", function(){
    this.testList(["01187654321", "0411187654321", "551187654321", "90411187654321", "+551187654321"], "BR", "(11) 8765-4321");
    this.testList(["011987654321", "04111987654321", "5511987654321", "904111987654321", "+5511987654321"], "BR", "(11) 98765-4321");
});
