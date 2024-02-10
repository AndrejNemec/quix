import { RouterProvider } from '@tanstack/react-router'
import { createServerHandler } from 'quix/server'

export default createServerHandler(async (router) => {
    return (
        <RouterProvider router={router}/>
    )
})