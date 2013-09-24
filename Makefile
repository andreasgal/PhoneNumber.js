all: PhoneNumberMetadata.js

%.js: %.xml xml2meta.py
	python xml2meta.py $< > $@

PhoneNumberMetadata.xml:
	curl http://libphonenumber.googlecode.com/svn/trunk/resources/PhoneNumberMetadata.xml > $@

clean:
	rm -f PhoneNumberMetadata.xml *~
