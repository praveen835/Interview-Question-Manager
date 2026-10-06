def test_create_and_read_question(client, question_payload):
    created = client.post("/questions/", json=question_payload)

    assert created.status_code == 200
    question = created.json()
    assert question["question"] == question_payload["question"]
    assert question["completed"] is False

    fetched = client.get(f"/questions/{question['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == question


def test_list_questions(client, question_payload):
    client.post("/questions/", json=question_payload)

    response = client.get("/questions/")

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_update_question(client, question_payload):
    question_id = client.post("/questions/", json=question_payload).json()["id"]
    updated_payload = {
        **question_payload,
        "question": "What is lexical scope?",
        "completed": True,
    }

    response = client.put(f"/questions/{question_id}", json=updated_payload)

    assert response.status_code == 200
    assert response.json()["question"] == "What is lexical scope?"
    assert response.json()["completed"] is True


def test_mark_question_completed(client, question_payload):
    question_id = client.post("/questions/", json=question_payload).json()["id"]

    response = client.patch(f"/questions/{question_id}/complete")

    assert response.status_code == 200
    assert response.json()["completed"] is True


def test_delete_question(client, question_payload):
    question_id = client.post("/questions/", json=question_payload).json()["id"]

    response = client.delete(f"/questions/{question_id}")

    assert response.status_code == 200
    assert response.json()["id"] == question_id
    assert client.get(f"/questions/{question_id}").status_code == 404


def test_missing_question_returns_404(client):
    response = client.get("/questions/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Question not found"}
