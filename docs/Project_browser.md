# Project browser

A decent project browser must be added to the UI. Main functions:

## Basic functions
    * Create folders and files ( @ eac79b4b934f4870d2c1657317e177fa46fa986f )
    * Delete folders and files ( @ eac79b4b934f4870d2c1657317e177fa46fa986f )
    * Rename folders and files
    * Move files or folders

## Advanced functions
### Open files
Important features:
- Code highlight
- Automatic tabulation
- Step by step execution
### Execute files from context menu
The user must be able to execute codes manually (by clicking to the execute item on context menu), execute everything in a folder, and execute some scripts automatically.

The automated script execution must happen during project opening, but it's important to be able to retrigger it without opening the project again. The most straightforward way to achive this is a script named `autostart.lgo` that will be executed automatically when the user opens a project. The user can execute this script anytime manually.

The error messages (and the fact that the subrutine were executed) must be displayed on the CommandLine. For this, I use a typesafe-bus instance, because CommandLine will receive displayable messages from everywhere.

Finished @ db3e215b5c1f67733eca291916e6448e999e75a2
### Specific icons to specific files or folders

## Text editor

A proper text editor must support the following functions:
* Auto formatter
* Syntax highlight
* Show errors
* Execute code
* Save
* Show line numbers

The text editor must be opened by double click on a file.

A good text editor is hard to implement, but I am sure that there are good similar packages for react.