import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import axios from "axios";
import { Form, Button, Row, Col, Card, Badge } from "react-bootstrap";
// import ImagePlugin, { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import ImagePlugin, { INSERT_IMAGE_COMMAND }  from "../components/ImagePlugin";
import { ImageNode } from "../js/ImageNode";

// Lexical 관련 import
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
// import { ImageNode } from "@lexical/image"; // 필요시 커스텀 처리
import { $generateHtmlFromNodes } from "@lexical/html";

const API_URL = "http://localhost:3000";

function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [editorState, setEditorState] = useState(null);
  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const contentRef = useRef("");

  // 데이터 로딩
  useEffect(() => {
    if (id) {
      axios.get(`${API_URL}/articles/${id}`).then((res) => {
        setTitle(res.data.title);
        contentRef.current = res.data.content || "";
        setImages(res.data.images || []);
        setTags(res.data.tags || []);
      });
    }
  }, [id]);

  const compressImage = async (file) => {
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1024 };
    return await imageCompression(file, options);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const compressed = await Promise.all(files.map(compressImage));
    const formData = new FormData();
    compressed.forEach((f) => formData.append("images", f));

    const res = await axios.post(`${API_URL}/upload/article`, formData);
    const uploaded = res.data;
    setImages((prev) => [...prev, ...uploaded]);
  };

  const handleDeleteImage = async (fileName) => {
    await axios.delete(`${API_URL}/delete/${fileName}`);
    setImages((prev) => prev.filter((img) => img.name !== fileName));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

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
      content: contentRef.current,
      images,
      tags,
      updatedAt: new Date().toISOString(),
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

    navigate(`/article/${id}`);
  };

  const initialConfig = {
    namespace: "Editor",
    theme: {},
    onError(error) {
      console.error("Lexical Error:", error);
    },
    editorState: contentRef.current,
    nodes: [HeadingNode, QuoteNode, ImageNode],
  };

  return (
    <div className="container py-4">
      <h2>{id ? "기사 수정" : "기사 작성"}</h2>

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요."
        />
      </Form.Group>

      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
            contentEditable={<ContentEditable className="editor border p-2 mb-3" style={{ minHeight: "300px", outline: "none" }} />}
            placeholder={<div className="text-muted">본문을 입력하세요.</div>}
            ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin
            onChange={(editorState, editor) => {
            setEditorState(editorState);
            editorState.read(() => {
                const html = $generateHtmlFromNodes(editor, null);
                contentRef.current = html;
            });
            }}
        />
        <HistoryPlugin />
        <ListPlugin />
        <ImagePlugin />
        </LexicalComposer>


      <Form.Group className="mb-3">
        <Form.Control type="file" multiple onChange={handleImageUpload} />
      </Form.Group>

      <Row className="mb-4">
        {images.map((img, idx) => (
          <Col key={idx} xs={6} md={3} className="mb-2">
            <Card>
              <Card.Img src={img.url} />
              <Card.Body className="text-center">
                <Button variant="danger" size="sm" onClick={() => handleDeleteImage(img.name)}>
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
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="#태그 입력 후 Enter"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
        />
        <div className="mt-2">
          {tags.map((tag, idx) => (
            <Badge key={idx} bg="secondary" className="me-1">
              {tag}{" "}
              <span style={{ cursor: "pointer" }} onClick={() => handleRemoveTag(tag)}>
                x
              </span>
            </Badge>
          ))}
        </div>
      </Form.Group>

      <div className="mb-3">
        <Button variant="outline-secondary" className="me-2" onClick={shareFacebook}>
          Facebook 공유
        </Button>
        <Button variant="outline-info" className="me-2" onClick={shareTwitter}>
          Twitter 공유
        </Button>
        <Button variant="outline-warning" onClick={shareKakao}>
          Kakao 공유
        </Button>
      </div>

      <Button variant="primary" onClick={handleSave}>
        {id ? "수정" : "등록"}
      </Button>
    </div>
  );
}

export default ArticleForm;
