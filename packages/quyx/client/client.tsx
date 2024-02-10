/// <reference types="vinxi/types/client" />
import "vinxi/client";
import { hydrateRoot, createRoot } from "react-dom/client";
import { type AnyRouter } from "@tanstack/react-router";
import { getManifest } from "vinxi/manifest";
import { type RouterHandler } from "../router";
import { QuyxProvider } from "../shared/QuyxContext";
import type { HTMLTag } from "../shared/types";
import type { ComponentType, PropsWithChildren, ReactNode } from "react";
import { SPA_WRAPPER_ID } from "../shared/constants";

//@ts-expect-error
import quyxRouter from '#quyx/router'
const routerEntry = quyxRouter as RouterHandler<AnyRouter>

//@ts-expect-error
import appComponent from '#quyx/app'
const AppComponent = appComponent as ComponentType<PropsWithChildren>

export type ClientRenderer = (router: AnyRouter) => Promise<ReactNode>

export const createClient = async (renderer: ClientRenderer) => {
	const clientManifest = getManifest("client");
	const assets = await clientManifest.inputs[clientManifest.handler].assets() as unknown as HTMLTag[];
	const router = await routerEntry({ isServer: false, currentPath: window.location.pathname })

	if (import.meta.env.QUIX_SSR) {
		await router.load()
	}

	const result = await renderer(router)

	if (import.meta.env.QUIX_SSR) {
		hydrateRoot(document, (
			<QuyxProvider assets={assets} router={router}>
				<AppComponent>
					{result}
				</AppComponent>
			</QuyxProvider>
		))
		return
	}

	createRoot(document.getElementById(SPA_WRAPPER_ID)!)
		.render(
			<>
				{result}
			</>
		)
}