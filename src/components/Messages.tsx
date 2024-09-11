'use client'

import { pusherClient } from '@/lib/pusher'
import { cn, toPusherKey } from '@/lib/utils'
import { Message } from '@/lib/validators/message'
import { format } from 'date-fns'
import Image from 'next/image'
import { FC, useEffect, useRef, useState } from 'react'

interface MessagesProps {
    initialMessages : Message[],
    sessionId : string,
    sessionImg : string | null | undefined,
    chatPartner : User
    chatId : string
}

const Messages: FC<MessagesProps> = ({initialMessages, sessionId, sessionImg, chatPartner, chatId}) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const [messages, setMessages] = useState<Message[]>(initialMessages)

    const formatTimestamp = (timestamp : number) => {
        const time = format(timestamp, 'HH:mm')
        return time
    }

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`chat:${chatId}`)
        );

        const messageHandler = (message: Message) => {
            setMessages((prev) => [message, ...prev]);
        };

        pusherClient.bind("incoming-message", messageHandler);

        return () => {
            pusherClient.unsubscribe(
                toPusherKey(`chat:${chatId}`)
            );

            pusherClient.unbind("incoming-message", messageHandler);
        };
    }, [chatId]);
  return (
    <div id='messages' className='flex flex-1 h-full flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue
    scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollerbar-w-2 scrolling-touch'>
        <div ref = {messagesEndRef}/>

        {messages.map((message, index) => {
           const isCurrentUser = message.senderId === sessionId

           const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId  
           
           return (
            <div key={`${message.id}-${message.timestamp}`} className='chat-message'>
                <div className={cn('flex items-end', {
                    'justify-end': isCurrentUser,
                })}>
                    <div className={cn('flex flex-col space-y-2 max-w-xs mx-2', {
                        'order-1 items-end': isCurrentUser,
                        'order-2 items-start': !isCurrentUser,
                    })}>
                        <span className={cn('px-4 py-2 rounded-lg inline-block', {
                            'bg-indigo-600 text-white': isCurrentUser,
                            'bg-gray-200 text-gray-900': !isCurrentUser,
                            'rounded-br-none': !hasNextMessageFromSameUser && isCurrentUser,
                            'rounded-bl-none': !hasNextMessageFromSameUser && !isCurrentUser,
                        })}>
                            {message.text}{' '}
                            <span className='ml-2 text-xs text-gray-400'>
                                {formatTimestamp(message.timestamp)}
                            </span>
                        </span>
                    </div>

                    <div className={cn('relative w-6 h-6', {
                        'order-2': isCurrentUser,
                        'order-1': !isCurrentUser,
                        'invisible': hasNextMessageFromSameUser
                    })}>
                        <Image 
                        fill 
                        alt='profile image'
                        src = {
                            isCurrentUser ? (sessionImg as string) : chatPartner.image
                        }
                        className='rounded-full'
                        referrerPolicy='no-referrer'
                        />
                    </div>
                </div>
            </div>
           )
        })}
    </div>
  )
}

export default Messages