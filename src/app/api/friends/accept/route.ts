import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {id: idToAdd} = z.object({id: z.string()}).parse(body)

        const session = await getServerSession(authOptions)
        if(!session){
            return (new Response('Unauthorized', {status: 401}))
        }

        //verify if already friends
        const isAlreadyFriends = await fetchRedis(`sismember`, `user:${session.user.id}:friends`, idToAdd)

        if(isAlreadyFriends){
            return new Response('Already friends', {status: 400})
        }
        
        //verify request exists
        const hasFriendRequest = await fetchRedis(`sismember`, `user:${session.user.id}:incoming_friend_requests`, idToAdd)

        if(!hasFriendRequest){
            return new Response('No friend request', {status: 400})
        }

        const [userRaw, friendRaw] = await Promise.all([
            fetchRedis('get', `user:${session.user.id}`),
            fetchRedis('get', `user:${idToAdd}`)
        ]) as [string | null, string | null] // Allow null values

        // Check if userRaw and friendRaw are defined before parsing
        const user = userRaw ? JSON.parse(userRaw) as User : null
        const friend = friendRaw ? JSON.parse(friendRaw) as User : null

        if (!user || !friend) {
            return new Response('User data not found', {status: 404}) // Handle missing user data
        }

        //notify added friend
        await Promise.all([
            pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`), 'new_friend', user),
            pusherServer.trigger(toPusherKey(`user:${session.user.id}:friends`), 'new_friend', friend),
            db.sadd(`user:${session.user.id}:friends`, idToAdd),
            db.sadd(`user:${idToAdd}:friends`, session.user.id),
            db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd)
        ])
        
        return new Response('OK', {status: 200})

    } catch (error) {
        console.log('Error', error)

        if(error instanceof z.ZodError){
            return new Response('Invalid request payload', {status: 422})
        }

        return new Response('Invalid request', {status: 400})   
    }
}