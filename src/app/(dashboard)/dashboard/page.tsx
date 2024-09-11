import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { FC } from 'react'
import { getFriendsByUserId } from '@/helpers/get-friends-by-userId'
import { fetchRedis } from '@/helpers/redis'
import { chatHrefConstructor } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface pageProps {
  
}

const page: FC<pageProps> = async ({}) => {
  const session = await getServerSession(authOptions)
  if(!session){
    redirect('/login')
  }
  const friends = await getFriendsByUserId(session.user.id)

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessageString] = await fetchRedis(
        'zrange',
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        '-1',
        '-1'
      ) as string[]
      const lastMessageData = JSON.parse(lastMessageString) as Message
      return {
        ...friend,
        lastMessage: lastMessageData
      }
    })
  )

  return (
    <div className='container py-12'>
      <h1 className='font-bold text-3xl mb-8 text-black-600 tracking-tight'>Recent Chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className='text-gray-500 text-sm text-center'>No recent chats</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div key={friend.id} className='relative bg-zinc-50 border border-zinc-200 p-3 rounded-md'>
            <div className='flex items-center absolute right-4 inset-y-0'>
              <ChevronRight className='h-7 w-7 text-zinc-500' />
            </div>
            <Link href={`/dashboard/chat/${chatHrefConstructor(session.user.id, friend.id)}`} className='relative sm:flex items-center'>
              <div className='mb-4 flex-shrink-0 sm:mb-0 sm:mr-4'>
                <div className="relative h-6 w-6">
                  <Image
                  referrerPolicy='no-referrer'
                  src={friend.image}
                  alt={`${friend.name} profile picture`}
                  fill
                  className='rounded-full'
                  />
                </div>
              </div>
              <div>
                <h4 className='text-lg font-semibold text-black-600'>{friend.name}</h4>
              <p className='mt-1 max-w-md text-sm text-black-300'>
                <span className='font-medium text-black-500'>
                  {friend.lastMessage?.senderId === session.user.id ? 'You: ' : ' '}
                </span>
                {friend.lastMessage.text}
              </p>
              </div>
            </Link>
          </div>
        )
      )
    )}
    </div>
  )
}




export default page