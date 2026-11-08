import json
import boto3
import uuid

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Expenses")


def lambda_handler(event, context):
    method = event["requestContext"]["http"]["method"]

    if method == "POST":
        body = json.loads(event["body"])
        body["expenseID"] = str(uuid.uuid4())
        table.put_item(Item=body)
        return {"statusCode": 200, "body": json.dumps({"message": "Expense saved successfully!"})}

    elif method == "GET":
        response = table.scan()
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(response["Items"], default=str)
        }

    elif method == "PUT":
        body = json.loads(event["body"])
        expense_id = body["expenseID"]
        table.update_item(
            Key={"expenseID": expense_id},
            UpdateExpression="SET description = :d, amount = :a, category = :c, #dt = :date",
            ExpressionAttributeNames={"#dt": "date"},
            ExpressionAttributeValues={
                ":d": body["description"],
                ":a": body["amount"],
                ":c": body["category"],
                ":date": body["date"]
            }
        )
        return {"statusCode": 200, "body": json.dumps({"message": "Expense updated successfully!"})}

    elif method == "DELETE":
        body = json.loads(event["body"])
        expense_id = body["expenseID"]
        table.delete_item(Key={"expenseID": expense_id})
        return {"statusCode": 200, "body": json.dumps({"message": "Expense deleted successfully!"})}

    return {"statusCode": 400, "body": json.dumps({"message": "Unsupported HTTP method"})}
