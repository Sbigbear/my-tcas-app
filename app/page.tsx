import { redirect } from 'next/navigation'

export default function Home() {
  // สั่งให้ redirect ไปหน้า /login ทันทีที่เปิดเข้ามาหน้าแรก
  redirect('/login')
}