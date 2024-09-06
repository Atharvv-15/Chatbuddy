import AddFriendButton from '@/components/AddFriendButton'
import { FC } from 'react'


const page: FC = ({}) => {
  return <main className='p-8'>
    <h1 className='text-5xl font-bold mb-8'>Add a friend</h1>
    <AddFriendButton/>
  </main>
}

export default page