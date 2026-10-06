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


def test_create_question_trims_text_fields(client, question_payload):
    payload = {key: f"  {value}  " for key, value in question_payload.items()}

    response = client.post("/questions/", json=payload)

    assert response.status_code == 200
    assert response.json()["question"] == question_payload["question"]
    assert response.json()["topic"] == question_payload["topic"]


def test_create_question_rejects_blank_fields(client, question_payload):
    question_payload["question"] = "   "

    response = client.post("/questions/", json=question_payload)

    assert response.status_code == 422


def test_create_question_rejects_topic_over_limit(client, question_payload):
    question_payload["topic"] = "t" * 51

    response = client.post("/questions/", json=question_payload)

    assert response.status_code == 422


def test_search_is_case_insensitive_and_includes_answers_and_topics(client, question_payload):
    client.post("/questions/", json=question_payload)

    answer_match = client.get("/questions/search/", params={"keyword": "RETAINS ACCESS"})
    topic_match = client.get("/questions/search/", params={"keyword": "javascript"})

    assert answer_match.status_code == 200
    assert len(answer_match.json()) == 1
    assert topic_match.status_code == 200
    assert len(topic_match.json()) == 1


def test_search_ignores_whitespace_only_keywords(client, question_payload):
    client.post("/questions/", json=question_payload)

    response = client.get("/questions/search/", params={"keyword": "   "})

    assert response.status_code == 200
    assert response.json() == []
