import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/appwrite/server'

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ userId: null, email: null, name: null })
        }

        return NextResponse.json({
            userId: user.$id,
            email: user.email,
            name: user.name
        })
    } catch (error) {
        console.error('[Session API] Error:', error)
        return NextResponse.json({ userId: null, email: null, name: null })
    }
}
