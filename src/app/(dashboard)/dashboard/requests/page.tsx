import { FC } from 'react'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import {fetchRedis} from '@/helpers/redis'
import FriendRequests from '@/components/FriendRequests'
import { authOptions } from '@/lib/auth'

const Page: FC = async () => {
    const session = await getServerSession(authOptions)

    if (!session) {
        notFound()
        return null
    }

    const incomingSenderIds = await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as string[]

    const incomingFriendRequests = await Promise.all(
        incomingSenderIds.map(async (senderId) => {
            const sender = await fetchRedis('get', `user:${senderId}`) as string
            const senderParsed = JSON.parse(sender) as User
            return {
                senderId,
                senderEmail: senderParsed.email
            }
        })
    )

    return (
        <main className='p-8'>
            <h1 className='text-5xl font-bold mb-8'>Friend Requests</h1>
            <div className='flex flex-col gap-4'>
                <FriendRequests incomingFriendRequests={incomingFriendRequests} sessionId={session.user.id} />
            </div>
        </main>
    )
}

export default Page