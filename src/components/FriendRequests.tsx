'use client'
import { Check, UserPlus, X } from 'lucide-react'
import { FC, useState } from 'react'

interface FriendRequestsProps {
    incomingFriendRequests : IncomingFriendRequest[]
    sessionId : string
}

const FriendRequests: FC<FriendRequestsProps> = ({
    incomingFriendRequests, 
    sessionId
}) => {
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
        incomingFriendRequests
    )
  return <>
    {friendRequests.length === 0 ? (
        <p className='text-sm text-gray-500'>Nothing to show here...</p>
    ) : (
        friendRequests.map((request) => (
            <div key={request.senderId} className='flex items-center gap-4'>
                <UserPlus className='h-4 w-4 text-black'/>
                <p className='font-medium text-lg'>{request.senderEmail}</p>
                <button aria-label='accept friend' className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'>
                    <Check className='h-3/4 w-3/4 font-semibold text-white'/>
                </button>
                <button aria-label='deny friend' className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'>
                    <X className='h-3/4 w-3/4 font-semibold text-white'/>
                </button>
                
            </div>
        ))
    )}
  </>
}

export default FriendRequests