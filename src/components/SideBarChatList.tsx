'use client'

import { chatHrefConstructor } from '@/lib/utils'
import { link } from 'fs'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'

interface SideBarChatListProps {
  friends : User[]
  sessionId : string
}

const SideBarChatList: FC<SideBarChatListProps> = ({friends, sessionId}) => {
    const router = useRouter()

    const pathname = usePathname()

    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

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