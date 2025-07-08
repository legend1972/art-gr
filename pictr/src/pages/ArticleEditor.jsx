import React, {useEffect, useState, useRef} from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import imageCompression from "browser-image-compression";
import axios from "axios";
import { Form, Button, Row, Col, Card, Badge} from 'react-bootstrap';

const API_URL = "http://localhost:3000";

function ArticleEditor() {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState([]);
    const quillRef = useRef();
    const navigate = useNavigate();

    //기사 ID 가 변경될 때 렌더링
    useEffect(() => {
        if(id) {
            axios.get(`${API_URL}/articles/${id}`).then(res => {
                setTitle(res.data.title);
                setContent(res.data.content);
                setImages(res.data.images || []);
                setTags(res.data.tags || []);
            })
        }
    }, [id]);

    //이미지 압축
    const compressImage = async (file) => {
        const options = {maxSizeMB: 1, maxWidthOrHeight: 1024};
        return await imageCompression(file, options);
    };

    //이미지 업로드
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        const compressed = await Promise.all(files.map(compressImage));
        const formData = new FormData();
        compressed.forEach(f => formData.append("images", f));

        const res = await axios.post(`${API_URL}/upload`, formData);
        const uploaded = res.data;

        uploaded.forEach(img => {
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection();
            editor.inserttEmbed(range ? range.index: 0, "image", img.url);
        });

        setImages(prev => [...prev, ...uploaded]);
    }

    //이미지 삭제
    const handleDeleteImage = async (fileName) => {
        await axios.delete(`${API_URL}/delete/${fileName}`);
        setImages(prev => prev.filter(img => img.name !== fileName));
    };

    //태그 추가
    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if(trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
        }
        setTagInput("");
    };

    //태그 삭제
    const handleRemoveTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    }

    const currentUrl = window.location.href;
    const shareKakao = () => {
        window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(currentUrl)}`, "_blank");
    };
    const shareTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`, "_blank");
    };
    const shareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, "_blank");
    };

    const handleSave = async () => {
        const data = {
        title,
        content,
        images,
        tags,
        updatedAt: new Date().toISOString()
        };

        if (id) {
            await axios.put(`${API_URL}/articles/${id}`, data);
            alert("수정 완료");
        } else {
            data.createdAt = new Date().toISOString();
            const res = await axios.post(`${API_URL}/articles`, data);
            alert("등록 완료");
            navigate(`/article/${res.data.id}`);
            return;
        }

        navigate(id ? `/article/${id}` : "/");
    };

    return (
        <div className="container py-4">
            <h2>{id ? "기사 수정": "기사 작성"}</h2>

            <Form.Group className="mb-3">
                <Form.Control 
                    type="text"
                    value={title}
                    onChange={e=>setTitle(e.target.value)}
                    placeholder="제목을 입력하세요."
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <ReactQuill
                    ref={quillRef}
                    value={content}
                    placeholder="본문을 입력하세요."
                    onChange={setContent}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Control
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                />
            </Form.Group>

            <Row className="mb-4">
                {images.map((img, idx) => (
                    <Col key={idx} xs={6} md={3} className="mb-2">
                        <Card>
                            <Card.Img src={img.url} />
                            <Card.Body className="textt-center">
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteImage(img.name)}
                                >
                                    삭제
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Form.Group className="mb-3">
                <Form.Control
                    type="text"
                    value={tagInput}
                    onChange={e=>setTagInput(e.target.value)}
                    placeholder="#테그 입력 후 Enter"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <div className="mt-2">
                    {tags.map((tag, idx) => (
                        <Badge key={idx} bg="secondary" className="me-1">
                            {tag} <span style={{cursor: "pointer"}} onClick={()=>handleRemoveTag(tag)}></span>
                        </Badge>
                    ))}
                </div>
            </Form.Group>

            <div className="mb-3">
                <Button variant="outline-secondary" className="me-2" onClick={shareFacebook}>Facebook 공유</Button>
                <Button variant="outline-info" className="me-2" onClick={shareTwitter}>Twitter 공유</Button>
                <Button variant="outline-warning" onClick={shareKakao}>Kakao 공유</Button>
            </div>

            <Button variant="primary" onClick={handleSave}>
                {id ? "수정" : "등록"}
            </Button>
        </div>
    );
}

export default ArticleEditor;