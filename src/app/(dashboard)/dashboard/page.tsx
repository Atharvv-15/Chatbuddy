
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"


const page = async () => {
  const session = await getServerSession(authOptions)
  return (
    <div>
        <h1 className='text-5xl font-bold mb-8 p-4'>Dashboard</h1>
    </div>
    
  )
  
}

export default page