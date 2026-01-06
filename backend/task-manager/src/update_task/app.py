import json
import boto3
from botocore.exceptions import ClientError
from datetime import datetime

# DynamoDB table initialization
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('task-manager')

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Content-Type": "application/json"
}

def lambda_handler(event, context):
    """
    Update an existing task.
    Path parameter: taskId (the full SK, e.g. TASK#2025-...-abc123)
    Body: any fields to update (partial updates supported)
    """
    try:
        #Get taskId from path parameters
        task_id = event['pathParameters'].get('taskId')
        if not task_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'taskId is required in path'}),
                'headers': CORS_HEADERS
            }
        
        # Parse body (fields to update)
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else {}

        if not body:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No fields provided to update'}),
                'headers': CORS_HEADERS
            }
        
        # Extract Cognito user sub from authorizer claims
        try:
            claims = event["requestContext"]["authorizer"]["jwt"]["claims"]
            user_sub = claims["sub"]
        except Exception:
            return {
                "statusCode": 401,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Unauthorized: missing or invalid token"}),
            }

        # Generate unique identifiers
        user_id = f"USER#{user_sub}"
        
        # Build UpdateExpression dynamically
        update_expression = "SET updatedAt = :updatedAt"
        expression_attribute_values = {
            ':updatedAt': datetime.utcnow().isoformat(),
            ':pk': user_id,
            ':sk': task_id
        }

        # Allowed updatable fields
        allowed_fields = {
            'title', 'description', 'dueDate', 'category',
            'priority', 'isStarred', 'isCompleted'
        }

        # Update only allowed fields, if any invalid field is provided, it is ignored.
        for key, value in body.items():                    
            if key in allowed_fields:
                # Special handling for some fields
                if key == 'priority':
                    value = str(value).lower()
                    if value not in {'low', 'medium', 'high'}:
                        value = 'medium'
                elif key == 'isStarred':
                    value = bool(value)
                elif key == 'isCompleted':
                    value = bool(value)
                elif key in {'title', 'description', 'category'}:
                    value = str(value).strip()

                update_expression += f", {key} = :{key}"
                expression_attribute_values[f':{key}'] = value


        # Perform the update (only if PK + SK match)
        response = table.update_item(
            Key={ # primary key
                'PK': user_id,
                'SK': task_id
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ConditionExpression="PK = :pk AND SK = :sk",
            ReturnValues="ALL_NEW" # to get the updated item back
        )

        updated_item = response.get('Attributes', {}) # attributes contains the updated item

        # Success response
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': 'Task updated successfully',
                'taskId': task_id,
                'updatedTask': updated_item
            }, indent=2)
        }

    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'ConditionalCheckFailedException':
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Task not found or does not belong to user'}),
                'headers': CORS_HEADERS
            }
        return {
            'statusCode': 500,
            'body': json.dumps({'error': e.response['Error']['Message']}),
            'headers': CORS_HEADERS
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': CORS_HEADERS
        }