import { RouterProvider } from '@tanstack/react-router'
import { createClient } from 'quix/client'

createClient(async (router) => {
    return (
        <RouterProvider router={router}/>
    )
})