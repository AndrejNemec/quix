import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { getData } from '../actions';

export const Route = createFileRoute('/')({
    component: IndexPage,
    meta: () => [
        {
            title: 'Home'
        }
    ]
})


function IndexPage() {
    return (
        <div>
            <h1>Home</h1>
        </div>
    )
}