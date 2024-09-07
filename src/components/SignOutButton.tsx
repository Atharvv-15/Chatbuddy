'use client'

import { FC, useState } from 'react'
import Button from './ui/Button'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Loader2, LogOut } from 'lucide-react'


const SignOutButton = ({...props}) => {
    const [isSigningOut, setIsSigningOut] = useState<boolean>(false)
  return <Button {...props} variant={'ghost'} size={'sm'} onClick={async () => {
    setIsSigningOut(true)
    try{
        await signOut()
    }catch(error){
        toast.error('There was a problem signing out')
    }finally{
        setIsSigningOut(false)
    }
  }}>
    {isSigningOut ? (
        <Loader2 className='h-4 w-4 animate-spin'/>
    ) : (
        <div className='flex items-center gap-2 mx-auto'>
            <LogOut className='h-5 w-5'/>
        </div>
        
    )}
  </Button>
}

export default SignOutButton