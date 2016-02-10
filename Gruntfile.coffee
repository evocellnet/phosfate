#global module:false
"use strict"

module.exports = (grunt) ->
  grunt.loadNpmTasks 'grunt-contrib-uglify';
  grunt.loadNpmTasks "grunt-bower-task"
  grunt.loadNpmTasks 'grunt-contrib-copy';
  grunt.loadNpmTasks 'grunt-exec';
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-watch"
  
  # grunt.loadNpmTasks('grunt-github-pages');    
  
  grunt.initConfig   
    uglify:
      jquery:
        files:
          '_assets/js/vendor/jquery.min.js': 'bower_components/jquery/dist/jquery.js'
      bootstrap:
        files:
          '_assets/js/vendor/bootstrap.min.js':'bower_components/bootswatch-dist/js/bootstrap.js'
      d3:
        files: 
          '_assets/js/vendor/d3.min.js':'bower_components/d3/d3.js'
      bootstrapprogressbar:
        files:
          '_assets/js/vendor/bootstrap-progressbar.min.js':'bower_components/bootstrap-progressbar/bootstrap-progressbar.js'    
      select2:
        files:
          '_assets/js/vendor/select2.min.js':'bower_components/select2/select2.js'
          
    copy:
      bootstrap: {
        files: [{
          expand:true
          cwd: 'bower_components/bootswatch-dist/'
          src: ['**']
          dest: 'assets/vendor/bootswatch/'
        },
        # {
        #   expand:true
        #   cwd: 'bower_components/select2-bootstrap-css'
        #   src: 'select2-bootstrap.css'
        #   dest: '_assets/css/vendor'
        # }
        {
          expand:true
          cwd: 'bower_components/jquery/dist/'
          src: ['**']
          dest: 'assets/vendor/jquery'
        },
        {
          expand:true
          cwd: 'bower_components/select2/'
          src: ['**']
          dest: 'assets/vendor/select2'
        }]
      }
      
    exec:
      build:
        cmd: 'jekyll build --config _config.yml,_config_dev.yml --trace'
      serve:
        cmd: 'jekyll serve --config _config.yml,_config_dev.yml --watch'
          
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
    "uglify"
    "copy"
    "exec:build"
  ]

  grunt.registerTask "serve", [
    "uglify"
    "copy"
    "exec:serve"
  ]

  grunt.registerTask "default", [
    "serve"
  ]

