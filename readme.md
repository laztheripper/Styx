# Styx

Companion app for Travincal. Tracks Diablo II accounts, characters and items, using non-intrusive (legit) means.
Runs on your pc while you play, listening in on game connections.

# Install

Simply run `install.cmd`. This will install nodejs version 13, and the building tools and node modules you need
GUI coming eventually to help with settings.

# Run

Start `run.cmd` or run index.js via nodejs

# Thanks

@Jaenster for the bones of this app.
@Doug for technical advice about D2 structs and protocols.

# Contribute

Styx is open source, meaning anyone can make pull requests or propose changes.
Areas I am most keen on getting a second opinion are:
- Styx <-> trav exchanges
- Account, character and item management (and events)
- Misc plugins, like an item drop notifier / logger, anything cool really (Plugins are loaded from the plugins folder and all the relevant classes have hooks you can sub to)
