/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

var PhoneNumber = (function (dataBase) {
  var regionCache = {};

  function ParseMetaData(md) {
    md = JSON.parse(md);
    md = {
      region: md[0],
      internationalPrefix: md[1],
      nationalPrefix: md[2],
      generalPattern: md[3],
      formats: md[4]
    };
    regionCache[region] = md;
    return md;
  }

  // Search for the meta data associated with a region identifier ("US") in
  // our database, which is indexed by country code ("1"). Since we have
  // to walk the entire database for this, we cache the result of the lookup
  // for future reference.
  function FindMetaDataForRegion(region) {
    region = region.toUpperCase();
    // Check in the region cache first. This will find all entries we have
    // already resolved (parsed from JSON).
    var md = regionCache[region];
    if (md)
      return md;
    for (countryCode in dataBase) {
      var entry = dataBase[countryCode];
      // Each entry is a JSON string that starts of the form '"US..', or
      // an array of JSON strings. We don't want to parse the JSON string
      // here to save memory, so we just substring the region identifier
      // and compare it. For arrays, we compare against all region
      // identifiers with that country code. We skip entries that are
      // of type object, because they were already resolved (parsed into
      // an object), and their country code should have been in the cache.
      if (entry instanceof Array) {
        for (var n = 0; n < entry.length; ++n) {
          if (entry[n].substr(1,2) == region)
            return entry[n] = ParseMetaData(entry[n]);
        }
      }
      if (entry instanceof String && entry.substr(1,2) == region)
        return dataBase[countryCode] = ParseMetaData(entry);
    }
  }

  return {
    FindMetaDataByRegion: FindMetaDataByRegion
  };
})(PHONE_NUMBER_META_DATA);

print(FindMetaDataByRegion("DE"));