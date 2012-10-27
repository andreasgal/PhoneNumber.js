/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

load("PhoneNumberMetaData.js");

var PhoneNumber = (function (dataBase) {
  const FILLER_CHARS = /#*()-\s/g;
  const PLUS_CHARS = /^\++/g;
  const BACKSLASH = /\\/g;
  const SPLIT_FIRST_GROUP = /^(\d+)(.*)$/;

  var regionCache = {};

  // Parse the string encoded meta data into a convenient object
  // representation.
  function ParseMetaData(countryCode, md) {
    var parsed = eval(md.replace(BACKSLASH, "\\\\"));
    md = {
      countryCode: countryCode,
      region: parsed[0],
      internationalPrefix: new RegExp("^" + parsed[1]),
      possiblePattern: new RegExp("^" + parsed[4] + "$"),
      nationalPattern: new RegExp("^" + parsed[5] + "$"),
      formats: parsed[6]
    };
    if (parsed[2])
      md.nationalPrefix = parsed[2];
    if (parsed[3])
      md.nationalPrefixFormattingRule = parsed[3];
    regionCache[md.region] = md;
    return md;
  }

  // Parse the string encoded format data into a convenient object
  // representation.
  function ParseFormat(md) {
    var formats = md.formats;
    // Bail if we already parsed the format definitions.
    if (!(formats[0] instanceof Array))
      return;
    for (var n = 0; n < formats.length; ++n) {
      var format = formats[n];
      var obj = {
        pattern: new RegExp("^" + format[0] + "$"),
        nationalFormat: format[1]
      }
      if (format[2])
        obj.leadingDigits = new RegExp("^" + format[2]);
      if (format[3])
        obj.nationalPrefixFormattingRule = format[3];
      if (format[4])
        obj.internationalFormat = format[4];
      formats[n] = obj;
    }
  }

  // Search for the meta data associated with a region identifier ("US") in
  // our database, which is indexed by country code ("1"). Since we have
  // to walk the entire database for this, we cache the result of the lookup
  // for future reference.
  function FindMetaDataForRegion(region) {
    // Check in the region cache first. This will find all entries we have
    // already resolved (parsed from a string encoding).
    var md = regionCache[region];
    if (md)
      return md;
    for (var countryCode in dataBase) {
      var entry = dataBase[countryCode];
      // Each entry is a string encoded object of the form '["US..', or
      // an array of strings. We don't want to parse the string here
      // to save memory, so we just substring the region identifier
      // and compare it. For arrays, we compare against all region
      // identifiers with that country code. We skip entries that are
      // of type object, because they were already resolved (parsed into
      // an object), and their country code should have been in the cache.
      if (entry instanceof Array) {
        for (var n = 0; n < entry.length; ++n) {
          if (typeof entry[n] == "string" && entry[n].substr(2,2) == region)
            return entry[n] = ParseMetaData(countryCode, entry[n]);
        }
        continue;
      }
      if (typeof entry == "string" && entry.substr(2,2) == region)
        return dataBase[countryCode] = ParseMetaData(countryCode, entry);
    }
  }

  function FormatNumber(region, number, intl) {
    ParseFormat(region);
    var formats = region.formats;
    for (var n = 0; n < formats.length; ++n) {
      var format = formats[n];
      if (format.leadingDigits && !format.leadingDigits.test(number))
        continue;
      if (!format.pattern.test(number))
        continue;
      if (intl) {
        var internationalFormat = format.internationalFormat;
        if (!internationalFormat)
          internationalFormat = format.nationalFormat;
        number = "+" + region.countryCode + " " +
                 number.replace(format.pattern, internationalFormat);
      } else {
        number = number.replace(format.pattern, format.nationalFormat);
        var nationalPrefixFormattingRule = region.nationalPrefixFormattingRule;
        if (format.nationalPrefixFormattingRule)
          nationalPrefixFormattingRule = format.nationalPrefixFormattingRule;
        if (number != "NA" && nationalPrefixFormattingRule) {
          var match = number.match(SPLIT_FIRST_GROUP);
          var firstGroup = match[1];
          var rest = match[2];
          var prefix = nationalPrefixFormattingRule;
          prefix = prefix.replace("$NP", region.nationalPrefix);
          prefix = prefix.replace("$FG", firstGroup);
          number = prefix + rest;
        }
      }
      return (number == "NA") ? null : number;
    }
    return null;
  }

  function ParsedNumber(region, number) {
    this.region = region;
    this.number = number;
  }

  ParsedNumber.prototype = {
    get internationalFormat() {
      var value = FormatNumber(this.region, this.number, true);
      Object.defineProperty(this, "internationalFormat", { value: value, enumerable: true });
      return value;
    },
    get nationalFormat() {
      value = FormatNumber(this.region, this.number, false);
      Object.defineProperty(this, "nationalFormat", { value: value, enumerable: true });
      return value;
    }
  };

  // Remove filler characters from a number.
  function StripNumber(number) {
    return number.replace(FILLER_CHARS, "");
  }

  // Check whether the number is valid for the given region.
  function IsValidNumber(number, md) {
    return md.possiblePattern.test(number);
  }

  // Check whether the number is a valid national number for the given region.
  function IsNationalNumber(number, md) {
    return IsValidNumber(number, md) && md.nationalPattern.test(number);
  }

  // Determine the country code a number starts with, or return null if
  // its not a valid country code.
  function ParseCountryCode(number) {
    for (var n = 1; n <= 3; ++n) {
      var cc = number.substr(0,n);
      if (dataBase[cc])
        return cc;
    }
    return null;
  }

  // Parse an international number that starts with the country code. Return
  // null if the number is not a valid international number.
  function ParseInternationalNumber(number) {
    var ret;

    // Parse and strip the country code.
    var countryCode = ParseCountryCode(number);
    if (!countryCode)
      return null;
    number = number.substr(countryCode.length);

    // Lookup the meta data for the region (or regions) and if the rest of
    // the number parses for that region, return the parsed number.
    var entry = dataBase[countryCode];
    if (entry instanceof Array) {
      for (var n = 0; n < entry.length; ++n) {
        if (typeof entry[n] == "string")
          entry[n] = ParseMetaData(countryCode, entry[n]);
        if (ret = ParseNationalNumber(number, entry[n]))
          return ret;
      }
      return null;
    }
    if (typeof entry == "string")
      entry = dataBase[countryCode] = ParseMetaData(countryCode, entry);
    return ParseNationalNumber(number, entry);
  }

  // Parse a national number for a specific region. Return null if the
  // number is not a valid national number (it might still be a possible
  // number for parts of that region).
  function ParseNationalNumber(number, md) {
    if (!md.possiblePattern.test(number) ||
        !md.nationalPattern.test(number)) {
      return null;
    }
    // Success.
    return new ParsedNumber(md, number);
  }

  // Parse a number and transform it into the national format, removing any
  // international dial prefixes and country codes.
  function ParseNumber(number, defaultRegion) {
    var ret;

    // Remove formating characters and whitespace.
    number = StripNumber(number);

    // Lookup the meta data for the given region.
    var md = FindMetaDataForRegion(defaultRegion.toUpperCase());

    // Detect and strip leading '+'.
    if (PLUS_CHARS.test(number))
      return ParseInternationalNumber(number.replace(PLUS_CHARS, ""));

    // See if the number starts with an international prefix, and if the
    // number resulting from stripping the code is valid, then remove the
    // prefix and flag the number as international.
    if (md.internationalPrefix.test(number)) {
      var possibleNumber = number.replace(md.internationalPrefix, "");
      if (ret = ParseInternationalNumber(possibleNumber))
        return ret;
    }

    // Now lets see if maybe its an international number after all, but
    // without '+' or the international prefix.
    if (ret = ParseInternationalNumber(number))
      return ret;

    // This is not an international number. See if its a national one for
    // the current region. National numbers can start with the national
    // prefix, or without.
    var nationalPrefix = md.nationalPrefix;
    if (nationalPrefix && number.indexOf(nationalPrefix) == 0 &&
        (ret = ParseNationalNumber(number.substr(nationalPrefix.length), md))) {
      return ret;
    }
    if (ret = ParseNationalNumber(number, md))
      return ret;

    // If the number matches the possible numbers of the current region,
    // return it as a possible number.
    if (md.possiblePattern.test(number))
      return new ParsedNumber(md, number);

    // We couldn't parse the number at all.
    return null;
  }

  return {
    Parse: ParseNumber
  };
})(PHONE_NUMBER_META_DATA);
