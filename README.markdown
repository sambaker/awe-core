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

Including as a submodule
------------------------

If you have a git project and you want to include this repository as a submodule run these commands:

    git submodule add https://github.com/sambaker/awe-core.git [destination folder]
    git submodule init
    git submodule update
