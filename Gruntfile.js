// Generated on 2014-01-18 using generator-angular 0.7.1
//modified for chromeapps 2/7/14
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist'
    },

    manifest: grunt.file.readJSON('app/manifest.json'),

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        //files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        files: ['<%= yeoman.app %>/scripts/**/*.js'],
        //tasks: ['newer:jshint:all'],
        options: {
          livereload: true,
          spawn: false
        }
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/style.{scss,sass}','<%= yeoman.app %>/styles/options.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
            '<%= yeoman.app %>/scripts/**/*.js',
            '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.app %>/manifest.json',
            '<%= yeoman.app %>/_locales/{,*/}*.json',
            '<%= yeoman.app %>/{,*/}*.html',
            '.tmp/styles/{,*/}*.css',
            '<%= yeoman.app %>/styles/{,*/}*.css'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    mocha: {
        all: {
            options: {
                run: true,
                timeout: 6000,
                src: ['testrunner.html'],
                urls: ['http://localhost:<%= connect.test.options.port %>/index.html']
            }
        }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    'bowerInstall': {
      target: {

        // Point to the files that should be updated when
        // you run `grunt bower-install`
        src: [
          '<%= yeoman.app %>/index.html',
          '<%= yeoman.app %>/options.html'
        ]
      }
    },

    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/styles',
        cssDir: 'app/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= yeoman.app %>/images',
        javascriptsDir: '<%= yeoman.app %>/scripts',
        fontsDir: '<%= yeoman.app %>/styles/fonts',
        importPath: '<%= yeoman.app %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false,
        raw: 'Sass::Script::Number.precision = 10\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },

    // Renames files for browser caching purposes
    //rev: {
    //  dist: {
    //    files: {
    //      src: [
    //        '<%= yeoman.dist %>/scripts/vendor.js',
    //        '<%= yeoman.dist %>/scripts/scripts.js'
    //      ]
    //    }
    //  }
    //},

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/{,*/}*.html',
      options: {

        compress: {
          global_defs: {
            "DEBUG": false
          },
          dead_code: true
        },

        flow: {
          html: {
            //take out uglify if it makes angular go nuts
            steps: {'js': ['concat']},
            //steps: {'js': ['concat', 'uglifyjs']},
            post: {}
          }
        },

        dest: '<%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    cssmin: {
      minify: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        src: '{,*/}*.css',
        dest: '<%= yeoman.dist %>/styles'
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '<%= yeoman.app %>/app/**/*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '*.html',
            '_locales/**/*',
            'images/{,*/}*.{webp}',
            'styles/{,*/}*.css'
          ]

        //we aren't minimizing this yet, maybe we should
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'compass:server'
      ],
      test: [
        'compass'
      ],
      dist: [
        'compass:dist',
        'imagemin',
        'svgmin'
      ]
    },

    chromeManifest: {
        dist: {
            options: {
                background: {
                    target: 'scripts/background.js',
                    exclude: [
                        'scripts/chromereload.js',
                        'scripts/angular-app/*',
                        'scripts/angular-chrome.js',
                        'scripts/worker-bower-components.js',
                        'scripts/options.js'
                    ]
                }
            },
            src: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>'
        }
    },

    compress: {
        dist: {
            options: {
                archive: 'package/overtab.zip'
            },
            files: [{
                expand: true,
                cwd: 'dist/',
                src: ['**'],
                dest: ''
            }]
        }
    },

    "hash-manifest": {
      dist: {
        options: {
            algo: "sha1",
            cwd: "dist"
        },
        src: [ "../package/*" ],
        dest: "../package/MANIFEST"
      }
    }

  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'bowerInstall',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('debug', function (opt) {
    if (opt && opt === 'jshint') {
        var watch = grunt.config('watch');
        //watch.livereload.tasks.push('jshint');
        grunt.config('watch', watch);
    }

    grunt.task.run([
        //'jshint',
        'connect:livereload',
        'watch'
    ]);
  });

  grunt.registerTask('test', [
    'connect:test',
    'mocha'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'chromeManifest',
    'bowerInstall',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngmin',
    'copy:dist',
    'cssmin',
    'uglify',
    'usemin',
    'htmlmin',
    'compress:dist',
    'hash-manifest:dist'
  ]);

  grunt.registerTask('default', [
    //'newer:jshint',
    'test',
    'build'
  ]);
};
