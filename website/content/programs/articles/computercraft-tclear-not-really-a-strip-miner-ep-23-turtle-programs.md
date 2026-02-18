### What it does
This program instructs a turtle to clear a specified cuboid area (depth x width x height) by digging out all blocks. In normal mode, it digs three layers at once; options like "layerByLayer" allow single-layer digging (e.g., for obsidian), and "stripMiner" adapts it for basic strip mining without inventory management or torch placement.

### Setup
You'll need a fueled mining turtle (e.g., with coal or other fuel). Download the program using `tLoader tClear` if you have tLoader installed, or via `pastebin get 07653J4E tClear`.

### Usage
Place the turtle at the starting position facing the direction you want to dig. Run the program with `tClear <depth> <width> <height> [options]`. 

- Positive parameters dig forward/right/up; negative ones dig backward/left/down.
- Options include `layerByLayer` for single-layer mining, `within` to restrict movement to the area, and `stripMiner` for strip mining mode.
- The turtle only mines within the specified cuboid.

For demos and details like digging basements or obsidian, see the video.

### Tips
Use `layerByLayer` for tough blocks like obsidian to avoid tool breakage. Refuel the turtle as needed for large areas, and monitor inventory manually in strip mining mode.