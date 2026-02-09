# Backend Coordination Layer (Django)

This module is responsible for coordinating system components.

Responsibilities:
- Expose APIs that call the intelligence layer
- Manage disaster scenario selection
- Serve data to frontend and mobile interfaces

Note:
This layer does NOT contain survival modeling or
rescue prioritization logic.

## API Flow
1. Receive worker/environment data
2. Invoke intelligence layer
3. Return ranked rescue priorities
