#!/usr/bin/env python3
"""Run end-to-end tests for the LOACL Streaming API.

This script performs end-to-end testing of the LOACL Streaming API, including:
- User registration and authentication
- Assistant creation and management
- Real-time streaming conversation testing
"""

import argparse
import asyncio
import json
import random
import sys
import time
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urljoin

import aiohttp
import requests


class StreamingAPITestFlow:
    """Test class for validating the LOACL Streaming API flow."""

    def __init__(self, base_url: str, assistant_id: str, openai_key: str):
        """Initialize the test flow.

        Args:
            base_url: Base URL of the API
            assistant_id: OpenAI Assistant ID
            openai_key: OpenAI API key
        """
        print("\nInitializing with:")
        print(f"Base URL: {base_url}")
        print(f"Assistant ID: {assistant_id}")
        print(f"OpenAI Key: {'*' * len(openai_key)}")

        self.base_url = base_url.rstrip("/")
        self.openai_assistant_id = assistant_id
        self.openai_key = openai_key
        self.access_token: Optional[str] = None
        self.local_assistant_id: Optional[str] = None
        self.thread_id: Optional[str] = None
        self.headers: Dict[str, str] = {}

        # Generate a random ID for the test user
        self.random_id = random.randint(1000, 9999)
        self.test_email = f"ashaheen+loacl+{self.random_id}@workhub.ai"
        self.test_password = "uraan123"

    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make an HTTP request to the API.

        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint
            data: Request data
            params: Query parameters

        Returns:
            API response as dictionary
        """
        url = urljoin(self.base_url, endpoint)
        headers = self.headers.copy()

        if data and method != "GET":
            # Sanitize data for logging
            log_data = data.copy()
            if "api_key" in log_data:
                log_data["api_key"] = "***"
            print(f"Request data: {json.dumps(log_data, indent=2)}")

            headers["Content-Type"] = "application/json"
            response = requests.request(
                method, url, json=data, headers=headers, params=params
            )
        else:
            response = requests.request(method, url, headers=headers, params=params)

        try:
            response.raise_for_status()
            return response.json() if response.text else {}
        except requests.exceptions.HTTPError as e:
            print(f"\nError in {method} {endpoint}:")
            print(f"Status code: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error response: {json.dumps(error_data, indent=2)}")
            except json.JSONDecodeError:
                print(f"Raw error response: {response.text}")
            raise e

    async def _stream_request(
        self,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Make a streaming request to the API.

        Args:
            endpoint: API endpoint
            data: Request data
            params: Query parameters
        """
        url = urljoin(self.base_url, endpoint)
        headers = self.headers.copy()
        headers["Content-Type"] = "application/json"
        headers["Accept"] = "text/event-stream"

        print(f"\nMaking streaming request to: {url}")
        print("Headers:", json.dumps(headers, indent=2))
        print("Data:", json.dumps(data, indent=2))
        if params:
            print("Params:", json.dumps(params, indent=2))

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url, json=data, params=params, headers=headers
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        print(f"\nError response status: {response.status}")
                        print(f"Error response headers: {response.headers}")
                        print(f"Error text: {error_text}")
                        return

                    print("\nStreaming response started...")
                    print(f"Response headers: {response.headers}")

                    event_type = None
                    async for line in response.content:
                        try:
                            line = line.decode("utf-8")
                            print(f"Raw line received: {line!r}")

                            if not line.strip():
                                continue

                            if line.startswith("event: "):
                                event_type = line[7:].strip()
                                continue

                            if line.startswith("data: "):
                                try:
                                    event_data = json.loads(line[6:])
                                    print(
                                        f"\nParsed event data: {json.dumps(event_data, indent=2)}"
                                    )

                                    if isinstance(event_data, dict):
                                        if (
                                            event_type == "thread.created"
                                            and "id" in event_data
                                        ):
                                            self.thread_id = event_data["id"]
                                            print(f"\nThread created: {self.thread_id}")
                                        elif event_type == "thread.message.delta":
                                            delta = event_data.get("delta", {})
                                            content = delta.get("content", [])
                                            for part in content:
                                                if part.get("type") == "text":
                                                    print(
                                                        part["text"]["value"],
                                                        end="",
                                                        flush=True,
                                                    )
                                        elif event_type == "thread.message.completed":
                                            print("\nMessage completed")
                                        elif event_type == "error":
                                            print(f"\nError: {event_data.get('error')}")
                                except json.JSONDecodeError as e:
                                    print(f"\nError parsing event data: {e}")
                                    print(f"Raw event data: {line[6:]}")

                        except Exception as e:
                            print(f"\nError processing line: {e}")
                            continue

        except Exception as e:
            print(f"\nError in streaming request: {e}")
            raise

    def register_user(self) -> Dict[str, Any]:
        """Register a new test user.

        Returns:
            Registration response
        """
        print("\n1. Registering user...")
        data = {
            "email": self.test_email,
            "password": self.test_password,
            "full_name": "Test User",
        }
        return self._make_request("POST", "/api/v1/auth/register", data)

    def login_user(self) -> Dict[str, Any]:
        """Log in the test user.

        Returns:
            Login response with access token
        """
        print("\n2. Logging in user...")
        data = {
            "grant_type": "password",
            "username": self.test_email,
            "password": self.test_password,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        response = requests.post(
            urljoin(self.base_url, "/api/v1/auth/login/access-token"),
            data=data,
            headers=headers,
        )
        response.raise_for_status()
        response_data = response.json()
        self.access_token = response_data["access_token"]
        self.headers["Authorization"] = f"Bearer {self.access_token}"
        return response_data

    def create_assistant(self) -> Dict[str, Any]:
        """Create a new assistant.

        Returns:
            Assistant creation response
        """
        print("\n3. Creating assistant...")
        if not self.openai_assistant_id.startswith("asst_"):
            raise ValueError(
                f"Invalid assistant ID format. Got '{self.openai_assistant_id}' "
                "but it must start with 'asst_'"
            )

        print(
            f"Creating assistant with OpenAI Assistant ID: {self.openai_assistant_id}"
        )
        data = {
            "name": "Test Assistant",
            "description": "A test assistant for API flow testing",
            "instructions": "You are a helpful test assistant",
            "model": "gpt-4-turbo-preview",
            "api_key": self.openai_key,
            "assistant_id": self.openai_assistant_id,
            "tools_enabled": ["code_interpreter"],
        }
        response = self._make_request("POST", "/api/v1/assistants", data)
        self.local_assistant_id = response["id"]
        print(f"Created local assistant with ID: {self.local_assistant_id}")
        return response

    async def send_streaming_message(self, message: str) -> None:
        """Send a message using streaming API.

        Args:
            message: Message content to send
        """
        print(f"\nSending message: {message}")

        # Create thread if we don't have one
        if not self.thread_id:
            message_data = {"role": "user", "content": message}
            data = {"messages": [message_data]}
            print("\nCreating new thread with data:", json.dumps(data, indent=2))
            endpoint = f"/api/v1/assistant-streaming/threads/stream"
            params = {"assistant_id": self.local_assistant_id}
        else:
            data = {
                "assistant_id": self.local_assistant_id,
                "instructions": None,
                "tools": [],
            }
            print("\nContinuing thread with data:", json.dumps(data, indent=2))
            endpoint = (
                f"/api/v1/assistant-streaming/threads/{self.thread_id}/runs/stream"
            )
            params = None

        await self._stream_request(endpoint, data, params)

    def delete_chat_session(self) -> None:
        """Delete the current chat session."""
        if self.thread_id:
            print("\nDeleting chat session...")
            # Get the session ID from the thread ID
            session_result = self._make_request(
                "GET",
                "/api/v1/assistant-communication/chat-sessions/messages",
                params={"assistant_id": self.local_assistant_id}
            )
            
            if session_result and len(session_result) > 0:
                session_id = session_result[0]["session_id"]
                try:
                    self._make_request(
                        "DELETE",
                        f"/api/v1/assistant-communication/chat-sessions/{session_id}",
                        params={"assistant_id": self.local_assistant_id}
                    )
                    print("Chat session deleted successfully")
                except Exception as e:
                    print(f"Error deleting chat session: {e}")
            else:
                print("No chat session found to delete")

    def delete_assistant(self) -> Dict[str, Any]:
        """Delete the test assistant.

        Returns:
            Deletion response
        """
        print("\n9. Deleting assistant...")
        return self._make_request(
            "DELETE", f"/api/v1/assistants/{self.local_assistant_id}"
        )


async def main() -> None:
    """Run the streaming API test flow."""
    parser = argparse.ArgumentParser(description="Test LOACL Streaming API flow")
    parser.add_argument(
        "--base-url", default="http://localhost:8000", help="Base URL of the API"
    )
    parser.add_argument("--assistant-id", required=True, help="OpenAI Assistant ID")
    parser.add_argument("--openai-key", required=True, help="OpenAI API Key")
    args = parser.parse_args()

    test_flow = StreamingAPITestFlow(args.base_url, args.assistant_id, args.openai_key)

    try:
        # Execute the test flow
        test_flow.register_user()
        test_flow.login_user()
        test_flow.create_assistant()

        print("\n=== Starting Streaming Conversation Test ===\n")

        # Test conversation with streaming responses
        conversations: List[Dict[str, str]] = [
            {
                "user": (
                    "Hello! I'm interested in learning about software testing "
                    "best practices. Can you help me understand the key "
                    "principles?"
                ),
                "context": "Initial question about testing principles",
            },
            {
                "user": (
                    "That's helpful! Could you elaborate specifically on the "
                    "difference between unit tests and integration tests, and "
                    "when to use each?"
                ),
                "context": "Follow-up on test types",
            },
            {
                "user": (
                    "Great explanation! Now, what are some popular Python "
                    "testing frameworks you'd recommend, and what makes them "
                    "stand out?"
                ),
                "context": "Question about testing tools",
            },
        ]

        for i, conv in enumerate(conversations, 1):
            print(f"\n=== Exchange {i} ===")
            print(f"\nContext: {conv['context']}")
            print(f"\nUser: {conv['user']}")

            await test_flow.send_streaming_message(conv["user"])
            print("\n" + "=" * 50)

        # Cleanup
        print("\n=== Cleanup ===")
        if test_flow.thread_id:
            test_flow.delete_chat_session()
        test_flow.delete_assistant()
        print("\nTest flow completed successfully!")

    except Exception as e:
        print(f"\nError during test flow: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
