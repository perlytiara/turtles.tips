# turtles.tips

Syncs the [TurtlesPAC](https://github.com/perlytiara/TurtlesPAC) archive. One submodule: **archive** (TurtlesPAC). Lean layout: `archive/programs` and `archive/community` at root — no duplicate folder names.

## Clone

```bash
git clone --recurse-submodules https://github.com/perlytiara/turtles.tips.git
cd turtles.tips/archive
```

## Update archive

```bash
git submodule update --remote archive
git add archive && git commit -m "chore: update archive"
```
