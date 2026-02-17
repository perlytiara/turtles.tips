# turtles.tips

CC:Tweaked programs and tips. One repo: **TurtlesPAC** (the archive) + **website** + **data** at root.

## Layout

| Path | Purpose |
|------|---------|
| **TurtlesPAC/** | Program archive: `programs/` (main repo) + `community/` (other repos) as submodules. See [TurtlesPAC/README.md](TurtlesPAC/README.md). |
| **website/** | Next.js app: programs browser, credits, docs. |
| **data/** | JSON for the website (credits, program overview). |

You always see the **TurtlesPAC** folder by name — that’s the archive (programs + community). Website and data live at repo root.

## Clone (with submodules)

```bash
git clone --recurse-submodules https://github.com/perlytiara/turtles.tips.git
cd turtles.tips
```

If already cloned without submodules:

```bash
git submodule update --init --recursive
```

## Update TurtlesPAC (submodule)

TurtlesPAC is one submodule; inside it, **programs** and **community/** are submodules of TurtlesPAC.

```bash
git submodule update --remote TurtlesPAC
git add TurtlesPAC && git commit -m "chore: update TurtlesPAC submodule"
```

To update programs/community inside TurtlesPAC: `cd TurtlesPAC && git submodule update --remote --merge`

## Run the website

```bash
cd website && npm install && npm run dev
```

Open <http://localhost:3000>.
