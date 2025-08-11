import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log webhook data for development
    console.log('Farcaster Webhook received:', {
      timestamp: new Date().toISOString(),
      data: body,
      headers: Object.fromEntries(req.headers.entries()),
    });

    // Handle different webhook types
    switch (body.type) {
      case 'frame_interaction':
        return handleFrameInteraction(body);
      
      case 'notification':
        return handleNotification(body);
      
      default:
        console.log('Unknown webhook type:', body.type);
        return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleFrameInteraction(data: unknown) {
  // Handle frame interactions (user clicks, form submissions, etc.)
  console.log('Frame interaction:', data);
  
  // You can add logic here to:
  // - Track user interactions
  // - Update user data
  // - Send notifications
  
  return NextResponse.json({ success: true });
}

async function handleNotification(data: unknown) {
  // Handle notification events
  console.log('Notification event:', data);
  
  // You can add logic here to:
  // - Send push notifications
  // - Update UI state
  // - Log events
  
  return NextResponse.json({ success: true });
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    app: 'Expendi Farcaster Webhook',
  });
}