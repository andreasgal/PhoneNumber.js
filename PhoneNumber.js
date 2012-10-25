/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

load("PhoneNumberMetaData.js");

var PhoneNumber = (function (dataBase) {
  var regionCache = {};

  function ParseMetaData(countyCode, md) {
    md = eval(md);
    md = {
      countryCode: countryCode,
      region: md[0],
      internationalPrefix: md[1],
      nationalPrefix: md[2],
      generalPattern: md[3],
      formats: md[4]
    };
    regionCache[md.region] = md;
    return md;
  }

  // Search for the meta data associated with a region identifier ("US") in
  // our database, which is indexed by country code ("1"). Since we have
  // to walk the entire database for this, we cache the result of the lookup
  // for future reference.
  function FindMetaDataForRegion(region) {
    region = region.toUpperCase();
    // Check in the region cache first. This will find all entries we have
    // already resolved (parsed from a string encoding).
    var md = regionCache[region];
    if (md)
      return md;
    for (countryCode in dataBase) {
      var entry = dataBase[countryCode];
      print(entry);
      // Each entry is a string encoded object of the form '["US..', or
      // an array of strings. We don't want to parse the string here
      // to save memory, so we just substring the region identifier
      // and compare it. For arrays, we compare against all region
      // identifiers with that country code. We skip entries that are
      // of type object, because they were already resolved (parsed into
      // an object), and their country code should have been in the cache.
      if (entry instanceof Array) {
        for (var n = 0; n < entry.length; ++n) {
          if (entry[n].substr(2,2) == region)
            return entry[n] = ParseMetaData(countryCode, entry[n]);
        }
        continue;
      }
      if (typeof entry == "string" && entry.substr(2,2) == region)
        return dataBase[countryCode] = ParseMetaData(countryCode, entry);
    }
  }

  return {
    FindMetaDataForRegion: FindMetaDataForRegion
  };
})(PHONE_NUMBER_META_DATA);

print(uneval(PhoneNumber.FindMetaDataForRegion("DE")));
