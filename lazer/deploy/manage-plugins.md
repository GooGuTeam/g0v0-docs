# 管理插件

插件是 g0v0 的核心功能之一，用户可以通过安装插件来扩展 g0v0 的功能。

## 获取并加载插件

### 官方插件

我们提供了一个仓库 [g0v0-plugins](https://github.com/GooGuTeam/g0v0-plugins)
来托管由 GooGuTeam 开发的官方插件。

使用 git 克隆仓库：

```bash
git clone https://github.com/GooGuTeam/g0v0-plugins.git
```

然后将你需要的插件文件夹复制到 g0v0 的 `plugins/` 目录下。或者你也可以编辑
`.env` 文件中的 `PLUGIN_DIRS` 来添加指定插件的路径。

```dotenv
PLUGIN_DIRS=["./plugins", "./g0v0-plugins"]
```

### 本地插件

你也可以自己开发插件并将其安装到 g0v0 中。将你的插件文件夹放在 g0v0 的
`plugins/` 目录下（或者在 `.env` 文件中配置
`PLUGIN_DIRS`），g0v0 会在启动时自动加载它。

插件开发的详细步骤请参考[插件开发](../development/plugin/)。

## 禁用插件

如果你想暂时禁用某个插件，可以在 `.env` 文件中配置
`DISABLED_PLUGINS`，将插件的 id 添加到列表中：

```dotenv
DISABLED_PLUGINS=["my_plugin"]
```

这样 g0v0 在启动时就会跳过加载 `my_plugin` 插件。

:::warning 注意

g0v0 不支持在运行时动态加载或卸载插件。要启用或禁用插件，必须修改 `.env`
文件并重启 g0v0。

:::

:::warning 注意

g0v0 禁用插件的原理是忽略这个插件，因此如果有插件依赖于被禁用的插件，插件会无法加载。请确保在禁用插件时考虑到插件之间的依赖关系。

:::
