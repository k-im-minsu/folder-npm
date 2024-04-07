# Folder-NPM  

## Features
---
+ #### Module management between folders is possible
+ #### It's easy to manage with private projects
+ #### Available with folder path and simple json creation
## Installation
---
```
npm install folder-npm
```  

## How to use
---
#### Prepare modue project A to be used first and project B to be applied
#### Create a "fnpm.json" file in Project A and write the following

```
//fnpm.json
{
    "ignore":[
        "node_modules/",
        ".git",
        "fnpm.json",
        "package-lock.json",
        ".gitignore"
        //===================================
        //Specify files/folders to exclude
        //===================================
    ],
    "dependencies":{}
}
```
### (How to write ignore)

| Option | Description |
| ------ | ----------- |
| path   | Remove only matching files/folders. ex) path, path/temp  |
| path/   | Remove only matching folders. ex) path/, temp/path/,path/temp  |
| /path | Remove only the files/folders that match from the beginning of the absolute path. ex) path, path/temp (not temp/path)|
| *.~    | Exclude all applicable extensions. ex) *.zip, *.json |

#### Go to project B, install "npm install folder-npm"
#### and make and wrtie script file, like the bottom
```
//install.js (Write the file name as comfortable as you like)

const fnpm=require('folder-npm')

fnpm.FromParentPath('{folder name of the A project}')
or
fnpm.Path('{path of the A project}') //C:\~
...(Add another module if present)

fnpm.Install()
```
##### "FromParentPath" search by the folder name of Project A in the top folder of Project B
##### "Path" search by the absolute path of Project A
##### "Install" It's a function that actually installs it  


#### Finally, run "node install.js" in the terminal(command)