#global module:false
"use strict"

module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-exec');
  # grunt.loadNpmTasks('grunt-github-pages');


  grunt.initConfig
    # concat:
    #   vendor: {
    #     src: [
    #       'bower_components/jquery/dist/jquery.js',
    #       'bower_components/bootswatch-dist/js/bootstrap.js',
    #       'bower_components/d3/d3.js',
    #     ],
    #     dest: "assets/vendor.js"
    #   }
      
    copy:
      bootstrap: {
        files: [{
          expand:true
          cwd: 'bower_components/bootswatch-dist/'
          src: ['**']
          dest: 'assets/vendor/bootswatch/'
        },
        {
          expand:true
          cwd: 'bower_components/jquery/dist/'
          src: ['**']
          dest: 'assets/vendor/jquery'
        },
        {
          expand:true
          cwd: 'bower_components/bootswatch-dist/js/'
          src: 'bootstrap.min.js'
          dest: '_assets/js/vendor'
        },
        {
          expand:true
          cwd: 'bower_components/d3'
          src: ['**']
          dest: 'assets/vendor/d3'
        },
        {
          expand:true
          cwd: 'bower_components/bootstrap-progressbar/'
          src: 'bootstrap-progressbar.js'
          dest: '_assets/js/vendor'
        },

        ]
      }
      
    exec:
      build: {
        cmd: 'jekyll build'
      },
      serve: {
        cmd: 'jekyll serve --baseurl= --watch'
      }
  

    # githubPages: {
    #   target: {
    #     options: {
    #       // The default commit message for the gh-pages branch
    #       commitMessage: 'generated'
    #     },
    #     // The folder where your gh-pages repo is
    #     src: '../dist'
    #   }
    # }

  grunt.registerTask "default", [
    # "concat"
    "copy"
    "exec:build"
  ]

  grunt.registerTask "serve", [
    # "concat"
    "copy"
    "exec:serve"
  ]

# grunt.registerTask('deploy', ['githubPages:target']);
