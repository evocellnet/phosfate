# #global module:false
# "use strict"

# module.exports = (grunt) ->
#   grunt.loadNpmTasks "grunt-bower-task"
#   grunt.loadNpmTasks "grunt-contrib-connect"
#   grunt.loadNpmTasks "grunt-contrib-watch"
#   grunt.loadNpmTasks('grunt-contrib-uglify');
#   grunt.loadNpmTasks('grunt-contrib-less');
#   grunt.loadNpmTasks('grunt-contrib-copy');
#   grunt.loadNpmTasks('grunt-exec');


#   grunt.initConfig
#     less: {
#       production: {
#         options: {
#           paths: ["bower_components/bootstrap/less"],
#           yuicompress: true
#         },
#         files: {
#           "_assets/css/application.min.css": "_assets/_less/application.less"
#         }
#       }
#     },
#     uglify: {
#       jquery: {
#         files: {
#           '_assets/js/jquery.min.js': 'bower_components/jquery/jquery.js'
#           }
#         },
#       bootstrap: {
#         files: {
#           '_assets/js/bootstrap.min.js': [
#             'bower_components/bootstrap/js/bootstrap-collapse.js',
#             'bower_components/bootstrap/js/bootstrap-scrollspy.js',
#             'bower_components/bootstrap/js/bootstrap-button.js',
#             'bower_components/bootstrap/js/bootstrap-affix.js']
#         }
#       }
#     },
#     copy: {
#       bootstrap: {
#         files: [
#           {expand: true, cwd: 'bower_components/bootstrap/img/', src: ['**'], dest: '_assets/img/'}
#         ]
#       }
#     },
#     bower:
#       install: {}

#     exec:
#       install:
#         cmd: "bundle install"
#       build: {
#         cmd: 'jekyll build --trace'
#       },
#       serve: {
#         cmd: 'jekyll serve --watch'
#       },
#       deploy: {
#         cmd: 'rake deploy'
#       }

#     watch:
#       options:
#         livereload: true
#       css:
#         files: [
#           "_assets/css/**/*"
#         ]
#         tasks: [
#           "copy"
#           "exec:build"
#         ]
#       html:
#         files: [
#           "_assets/**/*"
#           "_layouts/**/*"
#           "_includes/**/*"
#           "css/**/*"
#           "js/**/*"
#           "_config.yml"
#           "*.html"
#           "*.md"
#         ]
#         tasks: [
#           "exec:build"
#         ]

#     connect:
#       server:
#         options:
#           port: 4000
#           base: '_site'
#           livereload: true

#   grunt.registerTask('default', [ 'less', 'uglify', 'copy', 'exec:build' ]);

#   grunt.registerTask('deploy', [ 'default', 'exec:deploy' ]);

#   grunt.registerTask "build", [
#     "copy"
#     "exec:build"
#   ]

#   grunt.registerTask "serve", [
#     "build"
#     "connect:server"
#     "watch"
#   ]

#   grunt.registerTask "default", [
#     "build"
#   ]



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
    concat:
      vendor: {
        src: [
          'bower_components/jquery/dist/jquery.js',
          'bower_components/bootswatch-dist/js/bootstrap.js',
        ],
        dest: "assets/vendor.js"
      }
      
    copy:
      bootstrap: {
        files: [
          expand:true
          cwd: 'bower_components/bootswatch-dist/'
          src: ['**']
          dest: 'assets/bootswatch/'
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
    "concat"
    "copy"
    "exec:build"
  ]

  grunt.registerTask "serve", [
    "concat"
    "copy"
    "exec:serve"
  ]

# grunt.registerTask('deploy', ['githubPages:target']);
