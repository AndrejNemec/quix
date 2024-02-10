import { AnyRouter, DehydratedRouter } from '@tanstack/react-router'
import React, { ReactNode, createContext, useContext } from 'react'
import { HTMLTag } from './types'

export type DehydratedRouterType = {
    router: DehydratedRouter
    payload: any
}

export interface ServerContextType {
    assets: HTMLTag[]
    router: AnyRouter
    dehydrated?: any
    children: ReactNode
}

export const QuyxContext = createContext<ServerContextType>({} as ServerContextType)

export const useQuyxContext = () => useContext(QuyxContext)

export const QuyxProvider = ({ children, assets, router }: Omit<ServerContextType, 'dehydrated'>) => {
    if (import.meta.env.QUIX_SSR && typeof window !== 'undefined' && !router.state.lastUpdated) {
        router.hydrate()
    }
    const dehydrated = React.useMemo(() => {
        if (typeof window !== 'undefined' || !import.meta.env.QUIX_SSR) {
            return
        }
        
        return ({
            router: router.dehydrate(),
            payload: router.options.dehydrate?.(),
        })
    }, [])

    return (
        <QuyxContext.Provider value={{
            assets,
            router,
            children,
            dehydrated
        }}>
            {children}
        </QuyxContext.Provider>
    )
}