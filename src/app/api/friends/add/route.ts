import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import addFriendValidator from "@/lib/validators/add-friend"
import { getServerSession } from "next-auth"

export async function POST(request: Request) {
    try{
        const body = await request.json()

        const {email: emailToAdd} = addFriendValidator.parse(body.email)

        const RestResponse = await fetch(
            `${process.env.UPSTASH_REDIS_REST_URL}/get/user:${emailToAdd}`,
            {
                headers: {
                    Authorization : `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
                },
                cache : 'no-store'
            }
        )

        const data = (await RestResponse.json()) as {result: string | null}

        const idToAdd = data.result

        if(!idToAdd) {
            return new Response ('This user does not exist', {status : 400})
        }

        const session = await getServerSession(authOptions)

        if(!session) {
            return new Response('Unauthorized', {status : 401})
        }

        if (idToAdd === session.user.id) {
            return new Response('You cannot add yourself as a friend', {status : 400})
        }

        //check if user is already added
        const isAlreadyAdded = await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id) as 0 | 1

        if(isAlreadyAdded) {
            return new Response ('Already added this user', {status : 400})
        }

        //check if user is already a friend
        const isAlreadyFriend = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd)  as 0 | 1

        if(isAlreadyFriend) {
            return new Response ('Already a friend', {status : 400})
        }

        if(isAlreadyAdded) {
            return new Response ('Already added this user', {status : 400})
        }

        //valid request, send friend request
        db.sadd(`user:${idToAdd}: incoming_friend_requests`, session.user.id)
    }catch(error){

    }
}