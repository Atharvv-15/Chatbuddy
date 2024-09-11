import Icons, { Icon } from '@/components/Icons';
import SignOutButton from '@/components/SignOutButton';
import { authOptions } from '@/lib/auth';
import { LogOut } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC, ReactNode } from 'react';
import FriendRequestSidebarOptions from '@/components/FriendRequestSidebarOptions';
import { fetchRedis } from '@/helpers/redis';
import { getFriendsByUserId } from '@/helpers/get-friends-by-userId';
import SideBarChatList from '@/components/SideBarChatList';

interface LayoutProps {
  children: ReactNode;
  
}

interface SideBarOptions {
    id : number
    name : string
    href : string
    Icon : Icon
}

const sideBarOptions : SideBarOptions[] = [
    {
        id : 1,
        name : 'Add friend',
        href : '/dashboard/add',
        Icon : 'UserPlus'
    },
]

const Layout = async ({ children } : LayoutProps) => {
 
    const session = await getServerSession(authOptions) 

    if(!session) notFound()

    const friends = await getFriendsByUserId(session.user.id) 

    const unseenRequestsCount = (await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as User[]).length
  return (
    <div className='w-full h-screen flex'>
        <div className='flex h-full w-full max-w-xs grow flex-col gap-y-5 
        overflow-y-auto border-r border-gray-200 bg-white px-6'>
            <Link href={'/dashboard'} className='flex h-16 shrink-0 items-center'>
                <Icons.Logo className='h-8 w-auto text-indigo-600'/>
            </Link>

            {friends.length > 0 ? (
                <div className='text-xs font-semibold leading-6 text-gray-400'>Your Chats</div>
            ) : null}
            
            <nav className='flex flex-1 flex-col'>
                <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                    <li>
                        <SideBarChatList sessionId={session.user.id} friends={friends}/>
                    </li>
                    <li>
                        <div className='text-xs font-semibold leading-6 text-gray-400'>Overview</div>

                        <ul role='list' className='mt-2 -mx-2 space-y-1'>
                            {sideBarOptions.map((option) => {
                                const Icon = Icons[option.Icon]
                                return (
                                    <li key={option.id}>
                                        <Link className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold' href={option.href}>
                                            <span className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
                                                <Icon className='h-4 w-4'/>
                                            </span>
                                            <span className='truncate'>{option.name}</span>
                                        </Link>
                                        
                                    </li>
                                )
                            })}
                                    <li>
                                    <FriendRequestSidebarOptions sessionId={session.user.id} inititalFriendRequestCount={unseenRequestsCount} />
                                    </li>
                        </ul>
                    </li>

                   
                    <li className='-mx-8 mt-auto flex items-center '>
                        <div className='flex flex-1 px-6 py-3 gap-x-3 text-sm font-semibold leading-6 text-gray-900 gap-3 justify-center'>
                            <div className='relative h-8 w-8 bg-gray-50 '>
                                <Image 
                                    fill
                                    referrerPolicy = 'no-referrer'
                                    className= 'rounded-full mt-1'
                                    src={session.user.image || ''}
                                    alt='Your profile picture'
                                />
                            </div>

                            <span className='sr-only'>Your profile</span>
                            <div className='flex flex-col'>
                                <span aria-hidden='true'>{session.user.name}</span>
                                <span className='text-xs text-zinc-400 ' aria-hidden='true'>
                                    {session.user.email}
                                </span>
                            </div>
                            <SignOutButton className='h-full aspect-square'/>

                        </div>

                        
                    </li>
                </ul>
            </nav>
        </div>

        

      <aside className='w-full h-full bg-white max-h-screen container py-16 md:py-12'>
        {children}
      </aside>
    </div>
  );
}

export default Layout;