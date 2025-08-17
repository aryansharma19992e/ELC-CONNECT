import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await dbConnect()
    
    // Get connection status
    const connectionState = mongoose.connection.readyState
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
    
    // Get database info
    const dbName = mongoose.connection.db?.databaseName
    const collections = await mongoose.connection.db?.listCollections().toArray()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      connection: {
        state: connectionStates[connectionState as keyof typeof connectionStates],
        stateCode: connectionState,
        database: dbName,
        collections: collections?.map(col => col.name) || []
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
