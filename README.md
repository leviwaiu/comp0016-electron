# Meaningful Conversation Tagging

This project can be used to upload audio files containing conversations and return the data of important features within the conversations that can be used by the dialogue decider for further analysis.

## To Build
For people unfamiliar with node.js or with the terminal in general, we recommend people to use the binaries instead
provided at the releases page at github at https://github.com/leviwaiu/comp0016-electron/releases

Should you still decide to run this software from the source code, please follow these instructions.

1.If you haven't installed nodejs, visit nodejs.org, then download and install the package.

2.From the command line or equivalent, navigate to the root path of this project. Please run the following command:
```npm install```

3.When installation is finished, run the following command while remaining at the same directory:
```npm start```


## To Use
### Menu Screen
From the execution of the program, you would be able to enter into the main interface, where you can specify the service
that is needed (a future feature), the file(s) required to be transcribed, and the destination folder. Please use the buttons
to select the folders. 

Currently the options available for Speech To Text Service are as follows:
- IBM Watson
  - Required: API Key

There are three modes into the input selection:
 - Single File Mode: A Single File would be selected and processed
 - Multiple File Mode: Multiple Files are selected and would be processed
 - Directory Mode: The Directory is selected. All eligible audio files, *including all audio files from all its
 subdirectories*, would be processed.
 
To use one of the modes, just select the relevant files. The software would automatically select the suitable mode for you.

Please note that there would be no additional folder created for the destination selected. Please use your file explorer
to create a new folder if that is what is desired.

Please provide an API key for your service. This is hidden initially for your privacy, though you may opt to show it for
confirmation.

Should you want to change some of the options, such as model, or would like to keep/destroy all records that are kept in
the cloud software's servers, plesae use the Options button at the bottom. There would be dropdowns and checkboxes that
would allow you to alter the behaviour of this softwre.

###Analysing
During analysis, there may be times where the software seems to be not responding. This is normal. Should there be times
where the analysis process goes wrong, an error would appear and the user would be sent back to the main menu.

From this screen you can choose to view the logs should you want. This is where you can confirm that the user data is
deleted from the servers (unless the feature was disabled in the options screen.)

Once all the files are done, you would be presented with the option to continue with the process.

###Data Review
Behaviour of this screen is dependant on what mode the software is in.
- Directory Mode would show a directory tree with expandable subdirectories. The files that are generated would be in 
blue and is highlightable. Once clicking on a generated file, you would have the option to view it or to delete it.
- Multiple file mode would show you the list of different files that has been selected and gives options to view and
delete each one of them.
- Single file mode would give you the contents of the file immediately.

All modes here would allow you to delete all the files should you want to remove the progress. There would be a confirmation
prompt, and once that is confirmed the action is non-reversible.

Once review is completed you could either terminate the program by pressing X on top or by going back and have the software
analyse more files.

---

For further information regarding this project, please visit http://students.cs.ucl.ac.uk/2019/group43/index.html