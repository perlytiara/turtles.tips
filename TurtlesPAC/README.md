# TurtlesPAC (Turtles Programs And Computers)

This folder is the **program archive**: main programs and community repos as submodules. Part of the [turtles.tips](https://github.com/perlytiara/turtles.tips) repo.

| Path | Purpose |
|------|---------|
| **programs/** | Main programs (CC-Tweaked-TurtsAndComputers submodule) |
| **community/** | Community GitHub repos as submodules — see [community/README.md](community/README.md) |
| **docs/** | Credits and archive docs |
| **resources.md** | Non-GitHub links (Forums, Pastebin, Gists) |

Website and **data/** live at the repo root (turtles.tips), not inside TurtlesPAC.

## Update submodules

From repo root:

```bash
git submodule update --remote TurtlesPAC/programs
# or all: git submodule update --remote --merge
```
