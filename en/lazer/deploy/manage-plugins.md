# Manage Plugins

Plugins are one of the core features of g0v0. Users can install plugins to
extend g0v0's functionality.

## Get and Load Plugins

### Official Plugins

We provide a repository
[g0v0-plugins](https://github.com/GooGuTeam/g0v0-plugins) to host official
plugins developed by GooGuTeam.

Clone the repository using git:

```bash
git clone https://github.com/GooGuTeam/g0v0-plugins.git
```

Then copy the plugin folders you need to g0v0's `plugins/` directory. Or you can
edit `PLUGIN_DIRS` in the `.env` file to add the path to specific plugins.

```dotenv
PLUGIN_DIRS=["./plugins", "./g0v0-plugins"]
```

### Local Plugins

You can also develop your own plugins and install them in g0v0. Place your
plugin folder in g0v0's `plugins/` directory (or configure `PLUGIN_DIRS` in the
`.env` file), and g0v0 will automatically load it at startup.

For detailed steps on plugin development, please refer to
[Plugin Development](../development/plugin/).

## Disable Plugins

If you want to temporarily disable a plugin, you can configure
`DISABLED_PLUGINS` in the `.env` file by adding the plugin's id to the list:

```dotenv
DISABLED_PLUGINS=["my_plugin"]
```

This way, g0v0 will skip loading the `my_plugin` plugin at startup.

:::warning Note

g0v0 does not support dynamically loading or unloading plugins at runtime. To
enable or disable plugins, you must modify the `.env` file and restart g0v0.

:::

:::warning Note

g0v0 disables plugins by ignoring them, so if other plugins depend on a disabled
plugin, those plugins will fail to load. Please consider the dependencies
between plugins when disabling them.

:::
