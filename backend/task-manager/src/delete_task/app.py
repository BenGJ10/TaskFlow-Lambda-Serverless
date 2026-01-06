import json
import boto3
from botocore.exceptions import ClientError

# DynamoDB table
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
    Delete an existing task.
    Path parameter: taskId (the full SK, e.g. TASK#2025-...-abc123)
    """
    try:
        # Get taskId from path parameters
        task_id = event['pathParameters'].get('taskId')
        
        if not task_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'taskId is required in path'}),
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
        
        # Delete the item (with condition to ensure it belongs to the user)
        response = table.delete_item(
            Key={
                'PK': user_id,
                'SK': task_id
            },
            ConditionExpression="PK = :pk AND SK = :sk",
            ExpressionAttributeValues={
                ':pk': user_id,
                ':sk': task_id
            },
            ReturnValues="ALL_OLD"  # return the deleted item for confirmation
        )

        # Get the deleted item details
        deleted_item = response.get('Attributes', {})

        # If no item was deleted, it means it didn't exist
        if not deleted_item:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Task not found'}),
                'headers': CORS_HEADERS
            }
        
        # Return success response
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': 'Task deleted successfully',
                'taskId': task_id,
                'deletedTask': deleted_item
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