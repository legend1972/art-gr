/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, ListGroup } from 'react-bootstrap';

const API_URL = "http://localhost:3000/comments";

//댓글 달기
//artworkId: 작품ID
function CommentSection({artworkId}) {
    const [text, setText] = useState("");
    const [comments, setComments] = useState([]);

    //작품의 댓글 조회
    const loadComments = async () => {
        // const res = await axios.get(`http://localhost:3000/comments?artworkId=${artworkId}`);
        const res = await axios.get(`${API_URL}?artworkId=${artworkId}`);
        setComments(res.data);
    }

    //artworkId 가 변경될 때마다 댓글 조회
    useEffect(() => {
        loadComments();
    }, [artworkId]);

    //댓글 저장
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!text.trim()) return;

        const newComment = {
            artworkId,
            author: "익명", //댓글을 단 사람으로 변경 필요
            text,
//            commentId, //comment 한 사람 id
            createdAt: new Date().toISOString(),
        };

        await axios.post(API_URL, newComment);
        setText('');
        loadComments();
    };

    //댓글 삭제
    const handleDelete = async (id) => {
        await axios.delete(`${API_URL}/${id}`);
        loadComments();
    };

    return (
        <div className="mt-4">
            <h5>댓글</h5>
            <Form onSubmit={handleSubmit} className="mb-3">
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="댓글을 입력하세요."
                    value={text}
                    onChange={(e)=>setText(e.target.value)}
                />
                <Button type="submit" className="mt-2">등록</Button>
            </Form>

            <ListGroup>
                {comments.map((comment) => (
                    <ListGroup.Item key={comment.id} className="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>{comment.author}</strong>
                            <div>{comment.text}</div>
                            <small className="text-muted">{new Date(comment.createdAt).toLocaleString()}</small>
                        </div>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={()=>handleDelete(comment.id)}
                        />
                    </ListGroup.Item>
                ))}            
            </ListGroup>
        </div>
    );
}

export default CommentSection;