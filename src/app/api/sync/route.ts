import { NextResponse } from 'next/server';

// Mock storage for lesson progress on the server
// In a real application, this would be a database
let progressStore: Record<string, any> = {};

// Initialize with some mock data if empty
function initializeMockData() {
  if (Object.keys(progressStore).length === 0) {
    // Mock data for two courses and a few modules
    progressStore['course1:lesson1'] = {
      courseId: 'course1',
      moduleId: 'lesson1',
      progress: 60,
      completed: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    };
    progressStore['course1:lesson2'] = {
      courseId: 'course1',
      moduleId: 'lesson2',
      progress: 100,
      completed: true,
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    };
    progressStore['course2:lesson1'] = {
      courseId: 'course2',
      moduleId: 'lesson1',
      progress: 30,
      completed: false,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function POST(request: Request) {
  try {
    initializeMockData();

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, errors: ['Invalid request format: updates must be an array'] },
        { status: 400 }
      );
    }

    const results: any[] = [];
    const errors: string[] = [];

    for (const update of updates) {
      const { entityKey, data } = update;
      if (!entityKey || !data) {
        errors.push(`Invalid update: missing entityKey or data`);
        continue;
      }

      // In a real app, we would validate the data and update the database
      // For now, we'll just store the update in our mock store and return the current state
      try {
        // Simulate server-side processing: we'll merge the update with any server-side validation
        // For simplicity, we'll just store the update as the new server state
        progressStore[entityKey] = {
          ...progressStore[entityKey],
          ...data,
          updatedAt: new Date().toISOString(), // Server updates the timestamp
        };

        // Return the current server state for this entity
        results.push({
          entityKey,
          data: progressStore[entityKey],
        });
      } catch (err) {
        errors.push(`Failed to process update for ${entityKey}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      errors,
      serverState: results,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, errors: [`Sync failed: ${String(err)}`] },
      { status: 500 }
    );
  }
}

// Add a GET endpoint to retrieve current server state for debugging
export async function GET() {
  try {
    initializeMockData();
    return NextResponse.json({
      success: true,
      serverState: progressStore,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, errors: [`Failed to retrieve server state: ${String(err)}`] },
      { status: 500 }
    );
  }
}