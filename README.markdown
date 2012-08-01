AWE (Artefact Web Extensions) Core library
==========================================

Overview
--------

The purpose of this library is to share the Javascript functionality that is common to most of Artefact's web app projects in a single repo.

The initial feature set will be anything that is in common use and duplicated between our projects and over time more features will be added.

We will not be supporting all browsers. The expected supported browser set is:

* IE7+
* Safari 4+
* Chrome
* Opera
* Mobile Safari

There are no external dependencies besides having a sufficiently compliant browser.

Documentation is published here http://sambaker.github.com/awe-core/docs/

Installing
----------

Copy the awe-*.js files to you project's javascript directory.

Currently, awe-ui depends on the *x* library from cross-browser.com. 
    
AWE and Rails Apps
------------------

There is a nifty gem that will make it easy to install AWE into the Rails 3.1 asset pipeline and keep it up to date. See https://github.com/shyam-habarakada/awe-rails

How to document
---------------

Comments beginning with // are parsed as markdown format comments and added to the HTML output by docco. Each function/class/constant should have some form of // comment.

To generate documentation to the docs folder, run:

docco *.js

Load doc/index.html into a browser to test the formatting of the docs.

To automatically publish changes to http://sambaker.github.com/awe-core/doc/ when commiting the master branch, run the following command from the awe-core folder:

git config --add remote.origin.push +refs/heads/master:refs/heads/gh-pages

Then when you do a git push, the repo will be pushed to the gh-pages branch that github uses to serve http://sambaker.github.com/awe-core/docs/

