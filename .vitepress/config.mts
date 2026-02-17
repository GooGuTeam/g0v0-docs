import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  locales: {
    en: {
      label: 'English',
      lang: 'en',
      title: 'g0v0!',
      description: 'Simple and Easy-to-Deploy osu!(lazer) Server Solution',
      themeConfig: {
        nav: [
          { text: 'g0v0-server', link: '/en/lazer/' },
          { text: 'osu! GU', link: 'https://github.com/GooGuTeam/osu' },
          {
            text: 'LazerAuthlibInjector',
            link: 'https://github.com/MingxuanGame/LazerAuthlibInjection',
          },
        ],
        sidebar: {
          '/en/lazer/': [
            { text: 'Overview', link: '/en/lazer/' },
            {
              text: 'Deployment',
              items: [
                {
                  text: 'Deploy with Docker',
                  link: '/en/lazer/deploy/deploy-with-docker',
                },
                {
                  text: 'Customize Your Server',
                  link: '/en/lazer/deploy/customize-server',
                },
                { text: 'Manage Plugins', link: '/en/lazer/deploy/manage-plugins' },
                {
                  text: 'Deploying the Frontend',
                  link: '/en/lazer/deploy/frontend',
                },
              ],
            },
            {
              text: 'Maintenance',
              items: [
                {
                  text: 'Add Daily Challenge',
                  link: '/en/lazer/maintenance/add-daily-challenge',
                },
                {
                  text: 'Recalculate PP and Stats',
                  link: '/en/lazer/maintenance/recalculate-pp-and-stats',
                },
              ],
            },
            {
              text: 'Development',
              items: [
                {
                  text: 'Plugin Development',
                  items: [
                    {
                      text: 'Create and Load Plugins',
                      link: '/en/lazer/development/plugin/create-and-load-plugin',
                    },
                    { text: 'Register API', link: '/en/lazer/development/plugin/api-router' },
                    {
                      text: 'Define Database Models',
                      link: '/en/lazer/development/plugin/define-database-model',
                    },
                    {
                      text: 'Event Listening',
                      link: '/en/lazer/development/plugin/event-listener',
                    },
                    { text: 'Dependency Injection', link: '/en/lazer/development/plugin/di' },
                  ],
                  link: '/en/lazer/development/plugin/',
                },
              ],
            },
            {
              text: 'Reference',
              items: [
                { text: 'Configurations', link: '/en/lazer/reference/configurations' },
                { text: 'Built-in Events', link: '/en/lazer/reference/builtin-event' },
                { text: 'Built-in Dependency Injection', link: '/en/lazer/reference/builtin-di' },
              ],
            },
          ],
        },
        editLink: {
          pattern: 'https://github.com/GooGuTeam/g0v0-docs/edit/main/:path',
          text: 'Edit this page on GitHub',
        },
      },
    },
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: '咕哦！',
      description: '简单易部署的 osu!(lazer) 服务器方案',
      themeConfig: {
        nav: [
          { text: 'g0v0-server', link: '/lazer/' },
          { text: 'osu! GU', link: 'https://github.com/GooGuTeam/osu' },
          {
            text: 'LazerAuthlibInjector',
            link: 'https://github.com/MingxuanGame/LazerAuthlibInjection',
          },
        ],
        sidebar: {
          '/lazer/': [
            { text: '概览', link: '/lazer/' },
            {
              text: '部署',
              items: [
                {
                  text: '使用 Docker 部署项目',
                  link: '/lazer/deploy/deploy-with-docker',
                },
                {
                  text: '自定义你的服务器',
                  link: '/lazer/deploy/customize-server',
                },
                { text: '管理插件', link: '/lazer/deploy/manage-plugins' },
                {
                  text: '部署前端',
                  link: '/lazer/deploy/frontend',
                },
              ],
            },
            {
              text: '维护',
              items: [
                {
                  text: '添加每日挑战 (Daily Challenge)',
                  link: '/lazer/maintenance/add-daily-challenge',
                },
                {
                  text: '重新计算表现分和统计信息',
                  link: '/lazer/maintenance/recalculate-pp-and-stats',
                },
              ],
            },
            {
              text: '开发',
              items: [
                {
                  text: '插件开发',
                  items: [
                    {
                      text: '创建并加载插件',
                      link: '/lazer/development/plugin/create-and-load-plugin',
                    },
                    { text: '注册 API', link: '/lazer/development/plugin/api-router' },
                    {
                      text: '定义数据库模型',
                      link: '/lazer/development/plugin/define-database-model',
                    },
                    { text: '事件监听', link: '/lazer/development/plugin/event-listener' },
                    { text: '依赖注入', link: '/lazer/development/plugin/di' },
                  ],
                  link: '/lazer/development/plugin/',
                },
              ],
            },
            {
              text: '参考',
              items: [
                { text: '配置', link: '/lazer/reference/configurations' },
                { text: '内置事件', link: '/lazer/reference/builtin-event' },
                { text: '内置依赖注入', link: '/lazer/reference/builtin-di' },
              ],
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/GooGuTeam' }],
    logo: '/favicon.ico',

    footer: {
      message: 'Released under the MIT License',
      copyright: 'Copyright © 2026-present GooGuTeam',
    },

    editLink: {
      pattern: 'https://github.com/GooGuTeam/g0v0-docs/edit/main/:path',
      text: '在 GitHub 上编辑此页',
    },
  },

  lastUpdated: true,
})
