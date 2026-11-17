# 创建并加载插件

本节将介绍如何创建一个简单的插件，并在 g0v0 中加载它。

## 插件结构

一个插件是一个 Python 包，必须包含一个 `__init__.py` 文件。插件的目录结构如下：

```txt
my_plugin/
├── __init__.py
├── migrations/
│   └── ...
├── plugin.json
└── ...
```

- `__init__.py`：插件的入口文件。
- `migrations/`：数据库迁移文件夹。
- `plugin.json`：插件的元数据。

默认情况下，g0v0 会在 `plugins/` 目录下查找插件。你可以在 `plugins/`
目录下创建一个新的文件夹来存放你的插件，例如 `my_plugin/`。

```bash
mkdir -p plugins/my_plugin
cd plugins/my_plugin
touch __init__.py
mkdir migrations
```

## 插件元数据

每个插件都需要一个 `plugin.json` 文件来描述插件的基本信息。以下是一个示例
`plugin.json` 文件：

```jsonc
{
  "id": "my_plugin", // 插件的唯一标识符。这将用作数据库的前缀和 API 的前缀等。
  "name": "My Plugin", // 插件的名称。
  "version": "1.0.0", // 插件的版本号。
  "description": "A sample plugin named My Plugin.", // 插件的描述信息。
  "author": "Your Name", // 插件的作者信息。
  "dependencies": [], // 插件的依赖项列表，可以留空。填入其他插件的 id 来声明依赖关系。
}
```

将上述内容保存为 `plugins/my_plugin/plugin.json`。

## Hello World

现在我们已经创建了插件的基本结构和元数据，接下来我们将在 `__init__.py`
中实现一个简单的功能：当插件被加载时打印一条消息。

```python
print("Hello from My Plugin!")
```

当 g0v0 启动时，它会自动加载 `plugins/` 目录下的所有插件，并执行它们的
`__init__.py` 文件。你应该在控制台看到以下输出：

```txt
Hello from My Plugin!
```

## 添加依赖

如果你的插件需要依赖其他插件，你可以在 `plugin.json` 中的
`dependencies`字段中列出它们的 id。例如，如果你的插件依赖于一个名为
`other_plugin` 的插件，你可以这样写：

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

## 添加第三方库作为依赖

如果你的插件需要使用第三方库，你可以在插件的 `requirements.txt`
文件中列出这些库，或者使用 `pyproject.toml` 来管理依赖。

例如，如果你的插件需要使用 `websockets` 库，你可以在
`plugins/my_plugin/requirements.txt` 中添加以下内容：

```txt
websockets
```

然后使用 g0v0 根目录的 `install-all-deps.py` 脚本来安装所有插件的依赖：

```bash
python install-all-deps.py
```

:::tip 提示

使用 Docker 部署时，`install-all-deps.py`
脚本会在容器启动时自动运行，因此你不需要手动执行它。

:::
