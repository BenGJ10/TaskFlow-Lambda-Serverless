import json
import boto3
import os
import uuid
from datetime import datetime

# DynamoDB table initialization
dynamodb = boto3.resource('dynamodb') 
table = dynamodb.Table('task-manager') 

def lambda_handler(event, context):
    """
    Lambda function to create a new task in the DynamoDB table.
    Required: title
    Optional: description, dueDate, category, priority, isStarred, status
    """
    try:
        # Parse the incoming event body (handles both API Gateway event and direct invoke)
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event

        # Required field validation
        title = body.get('title')
        if not title or not isinstance(title, str) or len(title.strip()) == 0:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'title is required and cannot be empty'}),
                'headers': {'Content-Type': 'application/json'}
            }
        
        # Generate unique identifiers
        user_id = "USER#test-user-123"  # ← temporary fake user (later from Cognito)
        task_id = f"TASK#{datetime.utcnow().isoformat()}-{uuid.uuid4().hex[:8]}"

        # Prepare the item to be inserted
        item = {
            'PK': user_id,
            'SK': task_id,
            'title': title.strip(),
            'description': body.get('description', '').strip(),
            'dueDate': body.get('dueDate'),  # can be None or ISO string
            'category': body.get('category', 'personal').strip() or None,  # empty string → None
            'priority': body.get('priority', 'low').lower(),
            'isStarred': body.get('isStarred', False),
            'status': body.get('status', 'active').lower(),
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }

        # Enforce valid priority values
        valid_priorities = {'low', 'medium', 'high'}
        if item['priority'] not in valid_priorities:
            item['priority'] = 'low'

        # Insert the item into the DynamoDB table
        table.put_item(Item=item)

        # Success response
        return {
            'statusCode': 201,
            'body': json.dumps({
                'message': 'Task created successfully',
                'taskId': task_id,
                'task': item
            }, indent=2),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # temporary for local testing
            }
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Failed to create task',
                'details': str(e)
            }),
            'headers': {'Content-Type': 'application/json'}
        }