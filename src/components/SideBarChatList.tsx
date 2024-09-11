'use client'

import { pusherClient } from '@/lib/pusher'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import { link } from 'fs'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast' // Add this import
import UnseenChatToast from './UnseenChatToast'

interface SideBarChatListProps {
  friends : User[]
  sessionId : string
  sessionImage : string
  sessionName : string
}

interface ExtendedMessage extends Message {
    senderImg: string
    senderName: string
}

const SideBarChatList: FC<SideBarChatListProps> = ({friends, sessionId}) => { 
    const router = useRouter()

    const pathname = usePathname()

    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const newFriendHandler = () => {
            router.refresh()
        }

        const chatHandler = (message: ExtendedMessage) => {
            const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

            if (!shouldNotify) return

            // Notify user with a toast
            toast.custom((t) => (
                <UnseenChatToast 
                    t={t} 
                    sessionId={sessionId} 
                    senderId={message.senderId} 
                    senderImage={message.senderImg}
                    senderName={message.senderName}
                    senderMessage={message.text}
                />
            ), {
                id: message.id,
                duration: 4000
            })

            // should be notified
            router.refresh()

            setUnseenMessages((prev) => [...prev, message])
        }

        // Unbind previous handlers before binding new ones
        pusherClient.bind('new_message', chatHandler) 
        pusherClient.bind('new_friend', newFriendHandler)

        return () => {
            pusherClient.unbind('new_message', chatHandler) // Unbind chatHandler
            pusherClient.unbind('new_friend', newFriendHandler) // Unbind newFriendHandler
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))
        }
    }, [sessionId, pathname]) // Added pathname to dependencies

    useEffect(() => {
        if(pathname?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((message) => !pathname.includes(message.senderId))
            })
        }
    },[pathname])

  return <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 psace-y-1'>
    {friends.map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((unseenMessage) => {
            return unseenMessage.senderId === friend.id
        }).length

        return (<li key={friend.id}>
            <a className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold' href={`/dashboard/chat/${chatHrefConstructor(
                sessionId,
                friend.id
            )}`}>{friend.name}
            {unseenMessagesCount > 0 ? (
                <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex 
                justify-center items-center'> {unseenMessagesCount}</div>
            ) : null}</a>
        </li>)
    })}
  </ul>
}

export default SideBarChatList 