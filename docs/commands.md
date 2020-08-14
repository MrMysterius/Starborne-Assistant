# Commands

## Command Directorys Config

DirObject

- type: absolute | relative
- path: dir-path

abolute means a path that is abosulte and not relative, like the relative type, to the current working directory of the process.

This is the standard path

```json
    {
        "type": "relative",
        "path": "lib/commands"
    }
```

## Command File Structure

name: name
version: version number
command: command name for search
aliases: aliases for the name
run: function
