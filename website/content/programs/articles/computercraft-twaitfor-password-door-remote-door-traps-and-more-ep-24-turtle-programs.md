### What it does
tWaitFor and tSend are ComputerCraft programs that simplify using events for turtle-player interactions. They enable applications like password-protected doors, remote doors, traps, turtle synchronization, and event-based reactions (e.g., ringing a bell on specific triggers).

### Setup
- **Requirements**: A turtle with necessary peripherals (e.g., modem for rednet, redstone for outputs) and fuel. Works in mods like CC:Tweaked in FTB Direwolf20 1.16.
- **Installation**: Run `pastebin get 9vzPCd4T tWaitFor` and `pastebin get h3xcC9S1 tSend`. Alternatively, use tLoader (pastebin code TUAP1vFU) for downloads.

### Usage
Run tWaitFor as a function in your scripts (e.g., via `loadfile`) with parameters for events and responses, like `tWaitFor("rn", "1", "ding", "rn", "2", "alarm", "al", "12.0", "12.0")`. It returns a value based on the triggered event for custom actions (e.g., redstone outputs). Use tSend to trigger events remotely. See the video timestamps for demos: traps (05:39), remote doors (08:41), bell (10:33), security doors (15:16).

### Tips
Combine with startup scripts for persistent behavior. Check the example bell turtle code in the video description for handling multiple event reactions in a loop. For beginners, watch the linked turtle intro video.