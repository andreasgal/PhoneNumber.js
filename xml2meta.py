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

def nodeValue(x):
    if x == None:
        return ""
    return "\"" + x.nodeValue + "\""

def text(nodelist):
    rc = []
    for node in nodelist:
        if node.nodeType == node.TEXT_NODE:
            rc.append(node.data)
    return "\"" + "".join(rc) + "\""

def pattern(x):
    return re.sub(r"\s", "", text(x[0].getElementsByTagName("nationalNumberPattern")[0].childNodes))

def format(x):
    if len(x) == 0:
        return ""
    assert len(x) == 1
    result = []
    for numberFormat in x[0].getElementsByTagName("numberFormat"):
        attr = numberFormat.attributes
        pattern = nodeValue(attr.get("pattern"))
        format = text(numberFormat.getElementsByTagName("format")[0].childNodes)
        intlFormat = numberFormat.getElementsByTagName("intlFormat")
        if len(intlFormat) == 1:
            intlFormat = text(intlFormat[0].childNodes)
        else:
            intlFormat = ""
        result.append("[" + pattern + "," + format + "," + intlFormat + "]")
    return "[" + ",".join(result) + "]"

# go through the phone number meta data and convert and filter it into a JS file we will include
dom = parseString(data)
territories = dom.getElementsByTagName("phoneNumberMetadata")[0].getElementsByTagName("territories")[0].getElementsByTagName("territory")
map = {}
for territory in territories:
    attr = territory.attributes
    id = nodeValue(attr.get("id"))
    countryCode = nodeValue(attr.get("countryCode"))
    internationalPrefix = nodeValue(attr.get("internationalPrefix"))
    nationalPrefix = nodeValue(attr.get("nationalPrefix"))
    general = pattern(territory.getElementsByTagName("generalDesc"))
    formats = format(territory.getElementsByTagName("availableFormats"))
    if not countryCode in map:
        map[countryCode] = []
    map[countryCode].append("'[{0},{1},{2},{3},{4}]'".format(id,
                                                             internationalPrefix,
                                                             nationalPrefix,
                                                             general,
                                                             formats))

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
