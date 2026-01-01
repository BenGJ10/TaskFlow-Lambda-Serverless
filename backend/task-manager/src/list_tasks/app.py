import json
import boto3
from botocore.exceptions import ClientError

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
    List all tasks for the current user.
    For now uses fixed test user — later from Cognito JWT.
    Supports basic query parameters if needed (e.g. ?status=active).
    """
    try:

        # For now, use a fixed test user ID
        user_id = "USER#test-user-123"  # ← temporary fake user (later from Cognito)

        # Prepare the query parameters
        response = table.query(
            KeyConditionExpression='PK = :pk',
            ExpressionAttributeValues={
                ':pk': user_id
            }
        )

        # Collect the items
        items = response.get('Items', [])

        # Sorting by createdAt descending (newest first)
        items.sort(key = lambda x: x.get('createdAt', ''), reverse = True)

        # Success response
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': f'Found {len(items)} tasks',
                'tasks': items
            }, indent = 2)
        }
    
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'DynamoDB query failed',
                'details': e.response['Error']['Message']
            }),
            'headers': CORS_HEADERS
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': CORS_HEADERS
        }
        