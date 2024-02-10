import { createApp, type AppOptions, type ClientRouterSchema } from "vinxi"
import defu from "defu"
import { config } from "vinxi/plugins/config";
import react, { Options as ReactOptions } from "@vitejs/plugin-react";
import { join } from "node:path";
import type { CustomizableConfig } from "vinxi/dist/types/lib/vite-dev";
import { serverFunctions } from "@vinxi/server-functions/plugin";

export interface ConfigOptions extends Omit<CustomizableConfig, 'plugins'> {
    quix?: {
        appRoot?: string
        ssr?: boolean
        server?: AppOptions['server']
        features?: {
            serverFunctions?: boolean
            //serverComponents?: boolean
        }
    }
    react?: ReactOptions
    plugins?: ClientRouterSchema['plugins']
}

const defaultConfigOptions: ConfigOptions['quix'] = {
    appRoot: './src',
    ssr: true,
    server: {},
    features: {
        serverFunctions: true,
       // serverComponents: true
    }
}

export const defineConfig = (baseOptions: ConfigOptions = {}) => {
    let { plugins = [], quix = {}, react: reactOptions, ...userConfig } = baseOptions;
    quix = defu(quix, defaultConfigOptions)
    const isSsrEnabled: boolean = quix.ssr
    const isServerFunctionsEnabled: boolean = quix.features?.serverFunctions ?? true
    //const isServerComponentsEnabled: boolean = quix.features?.serverComponents ?? true

    let server = quix.server
    if (!isSsrEnabled) {
        server = { ...server, prerender: { routes: ["/"] } };
    }

    return createApp({
        server: server,
        routers: [
            {
                name: "public",
                type: "static",
                dir: "./public",
                base: "/",
            },
            {
                name: "client",
                type: "client",
                handler: `${quix.appRoot}/entry-client.tsx`,
                target: "browser",
                plugins: async () => {
                    return [
                        config("user", userConfig),
                        ...(typeof plugins === "function" ? [...(await (plugins as any)())] : plugins),
                        ...(isServerFunctionsEnabled ? [serverFunctions.client()] : []),
                        react(reactOptions),
                        config("app-client", {
                            resolve: {
                                alias: {
                                    "#quix/app": join(process.cwd(), quix.appRoot, `app.tsx`),
                                    "#quix/router": join(process.cwd(), quix.appRoot, `entry-router.tsx`),
                                    ...userConfig.resolve?.alias
                                }
                            },
                            define: {
                                "import.meta.env.SSR": JSON.stringify(false),
                                "import.meta.env.QUIX_SSR": JSON.stringify(isSsrEnabled),
                                "import.meta.env.SERVER_BASE_URL": JSON.stringify(quix?.server?.baseURL ?? ""),
                                ...userConfig.define
                            }
                        })
                    ]
                },
                base: "/_build",
            },
            {
                name: "ssr",
                type: "http",
                handler: `${quix.appRoot}/entry-server.tsx`,
                target: "server",
                plugins: async () => {
                    return [
                        config("user", userConfig),
                        ...(typeof plugins === "function" ? [...(await (plugins as any)())] : plugins),
                        react(reactOptions),
                        config("app-server", {
                            resolve: {
                                alias: {
                                    "#quix/app": join(process.cwd(), quix.appRoot, `app.tsx`),
                                    "#quix/router": join(process.cwd(), quix.appRoot, `entry-router.tsx`),
                                    ...userConfig.resolve?.alias
                                }
                            },
                            define: {
                                "import.meta.env.SSR": JSON.stringify(true),
                                "import.meta.env.QUIX_SSR": JSON.stringify(isSsrEnabled),
                                "import.meta.env.SERVER_BASE_URL": JSON.stringify(quix?.server?.baseURL ?? ""),
                                ...userConfig.define
                            }
                        })
                    ]
                },
                base: "/_server"
            },
            ...(isServerFunctionsEnabled ?
                [serverFunctions.router({
                    plugins: async () => {
                        return [
                            config("user", userConfig),
                            ...(typeof plugins === "function" ? [...(await (plugins as any)())] : plugins),
                            react(reactOptions),
                            config("app-server", {
                                resolve: {
                                    alias: {
                                        "#quix/app": join(process.cwd(), quix.appRoot, `app.tsx`),
                                        "#quix/router": join(process.cwd(), quix.appRoot, `entry-router.tsx`),
                                        ...userConfig.resolve?.alias
                                    }
                                },
                                define: {
                                    "import.meta.env.SSR": JSON.stringify(true),
                                    "import.meta.env.QUIX_SSR": JSON.stringify(isSsrEnabled),
                                    ...userConfig.define
                                }
                            })
                        ]
                    }
                })] : [])
        ],
    })
}