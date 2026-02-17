# Create and Load Plugins

This section will introduce how to create a simple plugin and load it in g0v0.

## Plugin Structure

A plugin is a Python package that must contain an `__init__.py` file. The
directory structure of a plugin is as follows:

```txt
my_plugin/
├── __init__.py
├── migrations/
│   └── ...
├── plugin.json
└── ...
```

- `__init__.py`: The entry file of the plugin.
- `migrations/`: Database migration folder.
- `plugin.json`: Metadata of the plugin.

By default, g0v0 looks for plugins in the `plugins/` directory. You can create a
new folder in the `plugins/` directory to store your plugin, for example
`my_plugin/`.

```bash
mkdir -p plugins/my_plugin
cd plugins/my_plugin
touch __init__.py
mkdir migrations
```

## Plugin Metadata

Each plugin needs a `plugin.json` file to describe the plugin's basic
information. Here is an example `plugin.json` file:

```jsonc
{
  "id": "my_plugin", // Unique identifier for the plugin. This will be used as database prefix, API prefix, etc.
  "name": "My Plugin", // Name of the plugin.
  "version": "1.0.0", // Version number of the plugin.
  "description": "A sample plugin named My Plugin.", // Description of the plugin.
  "author": "Your Name", // Author information.
  "dependencies": [], // List of plugin dependencies, can be left empty. Enter other plugin ids to declare dependencies.
}
```

Save the above content as `plugins/my_plugin/plugin.json`.

## Hello World

Now that we have created the basic structure and metadata for the plugin, let's
implement a simple feature in `__init__.py`: print a message when the plugin is
loaded.

```python
print("Hello from My Plugin!")
```

When g0v0 starts, it will automatically load all plugins in the `plugins/`
directory and execute their `__init__.py` files. You should see the following
output in the console:

```txt
Hello from My Plugin!
```

## Add Dependencies

If your plugin depends on other plugins, you can list their ids in the
`dependencies` field in `plugin.json`. For example, if your plugin depends on a
plugin named `other_plugin`, you can write:

```json {7}
{
  "id": "my_plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "A sample plugin named My Plugin.",
  "author": "Your Name",
  "dependencies": ["other_plugin"]
}
```

## Add Third-Party Libraries as Dependencies

If your plugin needs to use third-party libraries, you can list these libraries
in the plugin's `requirements.txt` file, or use `pyproject.toml` to manage
dependencies.

For example, if your plugin needs to use the `websockets` library, you can add
the following content to `plugins/my_plugin/requirements.txt`:

```txt
websockets
```

Then use the `install-all-deps.py` script in g0v0's root directory to install
all plugin dependencies:

```bash
python install-all-deps.py
```

:::tip Tip

When deploying with Docker, the `install-all-deps.py` script runs automatically
when the container starts, so you don't need to execute it manually.

:::
