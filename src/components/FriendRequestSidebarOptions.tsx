'use client'

import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import Icons from './Icons'
import { UserRound } from 'lucide-react'
import { toPusherKey } from '@/lib/utils'
import { pusherClient } from '@/lib/pusher'

interface FriendRequestSidebarOptionsProps {
  inititalFriendRequestCount : number,
  sessionId : string
}

const FriendRequestSidebarOptions: FC<FriendRequestSidebarOptionsProps> = ({inititalFriendRequestCount, sessionId}) => {
  const [unseenRequestsCount, setUnseenRequestsCount] = useState<number>(
    inititalFriendRequestCount
  )

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );

    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:friends`)
    )
    const friendRequestHandler = () => {
      setUnseenRequestsCount((prev) => prev + 1);
    };

    const addedFriendHandler = () => {
      setUnseenRequestsCount((prev) => prev - 1)
    }

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    pusherClient.bind("new_friend", addedFriendHandler)

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      )
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

      pusherClient.unbind('new_friend', addedFriendHandler)
      pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
    }
  },[sessionId])
  return (
    <Link href= {'/dashboard/requests'} className='text-gray-700 items-center hover:text-indigo-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
      <span className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
      <UserRound className='h-4 w-4'/>
      </span>
      <span className='truncate'>Friend requests</span> 

      {unseenRequestsCount > 0 ? ( <div className='rounded-full w-5 h-5 text-xs flex items-center justify-center text-white bg-indigo-600'>{unseenRequestsCount}</div>) : null} 
      
  </Link>
  )
}

export default FriendRequestSidebarOptions