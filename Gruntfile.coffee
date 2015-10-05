#global module:false
"use strict"

module.exports = (grunt) ->
  grunt.loadNpmTasks "grunt-bower-task"
  grunt.loadNpmTasks 'grunt-contrib-copy';
  grunt.loadNpmTasks 'grunt-exec';
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-watch"
  
  # grunt.loadNpmTasks('grunt-github-pages');


  grunt.initConfig      
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
          src: 'd3.min.js'
          dest: '_assets/js/vendor'
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
      build:
        cmd: 'jekyll build --trace'
      serve:
        cmd: 'jekyll serve --watch'
          
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

  grunt.registerTask "build", [
    "copy"
    "exec:build"
  ]

  grunt.registerTask "serve", [
    "copy"
    "exec:serve"
  ]

  grunt.registerTask "default", [
    "serve"
  ]

