import Image from "next/image";
import {db} from "../lib/db";

export default async function Home() {
  await db.set("test", "test") 
  return (
    <div><h1 className="text-3xl font-bold underline">ChatBUDYY</h1></div>
    
  );
}
