from array import array
from optparse import OptionParser
from xml.dom.minidom import parseString
import re

# parse command line arguments
use = "Usage: %prog [options] PhoneNumberMetaData.xml"
parser = OptionParser(usage = use)
parser.add_option("-v", "--verbose", dest="verbose", action="store_true", default=False, help="Set mode to verbose.")
options, args = parser.parse_args()

# we expect the dictionary name to be present
if len(args) < 1:
    print("Missing input file name.")
    exit(-1)

# read the input dictionary file
file = open(args[0])
data = file.read()
file.close()

def quote(x):
    return "\"" + x.replace("\\", "\\\\") + "\""

def nodeValue(x):
    if x == None:
        return ""
    return quote(x.nodeValue)

def text(nodelist):
    rc = []
    for node in nodelist:
        if node.nodeType == node.TEXT_NODE:
            rc.append(node.data)
    return quote("".join(rc))

def strip(x):
    return re.sub(r"\s", "", x)

def pattern(x, type):
    return strip(text(x[0].getElementsByTagName(type)[0].childNodes))

def format(x):
    if len(x) == 0:
        return ""
    assert len(x) == 1
    result = []
    for numberFormat in x[0].getElementsByTagName("numberFormat"):
        attr = numberFormat.attributes
        pattern = nodeValue(attr.get("pattern"))
        format = text(numberFormat.getElementsByTagName("format")[0].childNodes)
        leadingDigits = numberFormat.getElementsByTagName("leadingDigits");
        leadingDigitsResult = []
        for leadingDigit in leadingDigits:
            leadingDigitsResult.append(strip(text(leadingDigit.childNodes)))
        leadingDigits = "|".join(leadingDigitsResult)
        intlFormat = numberFormat.getElementsByTagName("intlFormat")
        if len(intlFormat) == 1:
            intlFormat = text(intlFormat[0].childNodes)
        else:
            assert len(intlFormat) == 0
            intlFormat = "";
        result.append("[" + ",".join([leadingDigits, pattern, format, intlFormat]) + "]")
    if len(result) > 1:
        return "[" + ",".join(result) + "]"
    return result[0]

# go through the phone number meta data and convert and filter it into a JS file we will include
dom = parseString(data)
territories = dom.getElementsByTagName("phoneNumberMetadata")[0].getElementsByTagName("territories")[0].getElementsByTagName("territory")
map = {}
for territory in territories:
    attr = territory.attributes
    region = nodeValue(attr.get("id"))
    countryCode = nodeValue(attr.get("countryCode"))
    internationalPrefix = nodeValue(attr.get("internationalPrefix"))
    nationalPrefix = nodeValue(attr.get("nationalPrefix"))
    possiblePattern = pattern(territory.getElementsByTagName("generalDesc"), "possibleNumberPattern")
    nationalPattern = pattern(territory.getElementsByTagName("generalDesc"), "nationalNumberPattern")
    formats = format(territory.getElementsByTagName("availableFormats"))
    mainCountryForCode = nodeValue(attr.get("mainCountryForCode"));
    if not countryCode in map:
        map[countryCode] = []
    map[countryCode].append("'[{0},{1},{2},{3},{4},{5}]'".format(region,
                                                                 internationalPrefix,
                                                                 nationalPrefix,
                                                                 possiblePattern,
                                                                 nationalPattern,
                                                                 formats))
    if len(map[countryCode]) > 1 and mainCountryForCode == "\"true\"":
        x = map[countryCode]
        t = x[0]
        x[0] = x[len(x)-1]
        x[len(x)-1] = t

print("/* Automatically generated. Do not edit. */")
print("const PHONE_NUMBER_META_DATA = {");
output = []
for cc in map:
    entry = map[cc]
    if len(entry) > 1:
        output.append(cc + ": [" + ",".join(entry) + "]")
    else:
        output.append(cc + ": " + entry[0])
for line in output:
    print(line + ",")
print("};")
