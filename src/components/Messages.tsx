'use client'

import { cn } from '@/lib/utils'
import { Message } from '@/lib/validators/message'
import { FC, useRef, useState } from 'react'

interface MessagesProps {
    initialMessages : Message[],
    sessionId : string
}

const Messages: FC<MessagesProps> = ({initialMessages, sessionId}) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const [messages, setMessages] = useState<Message[]>(initialMessages)
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
                                {message.timestamp}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
           )
        })}
    </div>
  )
}

export default Messages