---
applyTo: '**'
---
Coding standards, domain knowledge, and preferences that AI should follow.

I prefer going off corpnet and running commands than looking for workarounds because of corpnet restrictions

When working on a change, lets use an md file to track the requirement and how it is implemented. When we are ready to commit, the md file contents can be used to generate a commit message and the file can be deleted
The app folder should only contain sources. Any md files created should be in the .md folder at the root of the repo. Ask me before creating any other files for where it should be placed.
Any config or secrets that should not be checked in should be placed at /Users/m0p0qkq/.config/tripin and only a symbolic link should be placed in the repo.