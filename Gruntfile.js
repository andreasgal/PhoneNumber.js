var libphonenumberConvert = require("libphonenumber-convert"),
    fs = require("fs");

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        download: {
            "libphonenumber-xml": "http://libphonenumber.googlecode.com/svn/trunk/resources/PhoneNumberMetadata.xml",
            "output-js": "PhoneNumberMetadata.js"
        }
    });

    grunt.registerTask('dryrun', 'Downloads libphonenumber XML and generates JS file', function() {
        grunt.config.requires('download.libphonenumber-xml');

        var done = this.async();

        libphonenumberConvert(grunt.config('download.libphonenumber-xml'), function(err, data){
            if(err){
                grunt.log.writeln(err.message);
                return done(false);
            }
            grunt.log.writeln(data);
            done();
        });
    });

    grunt.registerTask('clean', 'Downloads libphonenumber XML and generates JS file', function() {
        grunt.config.requires('download.output-js');

        var done = this.async();

        fs.unlink(grunt.config('download.output-js'), function(err){
            if(err && err.code != "ENOENT"){
                grunt.log.writeln(err.message);
                return done(false);
            }
            grunt.log.writeln(grunt.config('download.output-js') + " removed successfully");
            done();
        })
    });

    grunt.registerTask('download', 'Downloads libphonenumber XML and generates JS file', function() {
        grunt.config.requires('download.libphonenumber-xml');
        grunt.config.requires('download.output-js');

        var done = this.async();

        libphonenumberConvert(grunt.config('download.libphonenumber-xml'), function(err, data){
            if(err){
                grunt.log.writeln(err.message);
                return done(false);
            }
            fs.writeFile(grunt.config('download.output-js'), data, function(err){
                if(err){
                    grunt.log.writeln(err.message);
                    done(false);
                }
                grunt.log.writeln(grunt.config('download.output-js') + " generated successfully");
                done();
            });
        });
    });

    grunt.registerTask('default', ['download']);
};