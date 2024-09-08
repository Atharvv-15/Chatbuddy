import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArrayValidator } from '@/lib/validators/message'
import { channel } from 'diagnostics_channel'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { parse } from 'path'
import { FC } from 'react'

interface pageProps {
  params: {
    chatId: string
  }
}

async function getChatMessages({chatId}: {chatId: string}) {
  try {
    const results: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1)

    const dbMessages = results.map((message) => JSON.parse(message) as Message)

    const reversedDbMessages = dbMessages.reverse()

    const messages = messageArrayValidator.parse(reversedDbMessages)

    return messages


  } catch (error) {
    notFound()
  }
}

const page: FC<pageProps> = async ({params} : pageProps) => {

  const {chatId} = params

  const session = await getServerSession(authOptions)

  if(!session) notFound()
  
  const {user} = session

  const [userId1, userId2] = chatId.split('--')

  if(user.id !== userId1 && user.id !== userId2) notFound()

  const chatPartnerId = user.id === userId1 ? userId2 : userId1

  const chatPartner = await db.get(`user:${chatPartnerId}`) as User

  const initialMessages = await getChatMessages({chatId}) 



  return <div>
    <h1 className='text-5xl font-bold mb-8 p-4'>Chat</h1>
    <p className='text-2xl font-semibold ml-3'>Chat with <span className='underline'>{params.chatId}</span></p>
  </div>
}

export default page